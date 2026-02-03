import React, { useState } from 'react';
import { contentService } from '../../services/contentService';
import { storageService } from '../../services/storageService';
import { cleanupService } from '../../services/cleanupService';
import { db } from '../../firebaseConfig';
import { doc, setDoc, writeBatch, collection } from 'firebase/firestore';
import { Database, UploadCloud, CheckCircle, AlertTriangle, Play, FileText, Image as ImageIcon, Trash2, RefreshCw, BookOpen } from 'lucide-react';
import { useConfirm, useToast } from '../../components/Toast';

const MigrationTools = () => {
    const [logs, setLogs] = useState([]);
    const [isMigrating, setIsMigrating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isCleaningUp, setIsCleaningUp] = useState(false);
    
    const confirm = useConfirm();
    const toast = useToast();

    const addLog = (msg, type = 'info') => {
        setLogs(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }]);
    };

    const migrateConfigs = async () => {
        addLog('🔄 Memulai Migrasi Konfigurasi...', 'info');
        
        const configs = [
            { key: 'arp_home_config', path: 'config/home', name: 'Home Config' },
            { key: 'arp_about_config', path: 'config/about', name: 'About Config' },
            { key: 'arp_profile_config', path: 'config/profile', name: 'Profile Config' },
            { key: 'arp_font_config', path: 'config/fonts', name: 'Font Config' }
        ];

        for (const cfg of configs) {
            const localData = localStorage.getItem(cfg.key);
            if (localData) {
                try {
                    let parsed = JSON.parse(localData);
                    
                    // PRE-PROCESS: Upload Base64 to Storage
                    parsed = await processBase64(parsed);
                    
                    // Save cleaned data to Firestore
                    await setDoc(doc(db, cfg.path.split('/')[0], cfg.path.split('/')[1]), parsed);
                    
                    // Update LocalStorage with cleaned data (so Scan shows 0 next time)
                    localStorage.setItem(cfg.key, JSON.stringify(parsed));
                    
                    addLog(`✅ ${cfg.name} Terupload & Dibersihkan.`, 'success');
                } catch (e) {
                    addLog(`❌ Gagal upload ${cfg.name}: ${e.message}`, 'error');
                }
            } else {
                addLog(`⚠️ ${cfg.name} tidak ditemukan di LocalStorage.`, 'warning');
            }
        }
    };

    const migrateCurriculum = async () => {
        addLog('🔄 Memulai Migrasi Kurikulum...', 'info');
        const localCurr = localStorage.getItem('arp_curriculum');
        if (!localCurr) {
            addLog('⚠️ Data Kurikulum tidak ditemukan.', 'warning');
            return [];
        }

        try {
            const parsed = JSON.parse(localCurr);
            await setDoc(doc(db, 'curriculum', 'main'), { items: parsed });
            addLog(`✅ Kurikulum (${parsed.length} topik) terupload.`, 'success');
            return parsed; // Return for lesson iteration
        } catch (e) {
            addLog(`❌ Gagal upload Kurikulum: ${e.message}`, 'error');
            return [];
        }
    };

    const migratePrograms = async () => {
         addLog('🔄 Memulai Migrasi Program Khusus...', 'info');
         const localData = localStorage.getItem('arp_special_programs');
         if (localData) {
             try {
                 let parsed = JSON.parse(localData);
                 
                 // PRE-PROCESS: Upload Base64 to Storage
                 parsed = await processBase64(parsed);

                 await setDoc(doc(db, 'special_programs', 'main'), { items: parsed });
                 
                 // Update LocalStorage
                 localStorage.setItem('arp_special_programs', JSON.stringify(parsed));
                 
                 addLog(`✅ Program Khusus terupload.`, 'success');
             } catch (e) {
                 addLog(`❌ Gagal upload Program Khusus: ${e.message}`, 'error');
             }
         }
    };

    // Helper to detect and upload Base64
    const processBase64 = async (contentString) => {
        // Regex to find Base64 images/pdfs: data:(image|application)\/[a-zA-Z]+;base64,[^"]+
        // This is complex to replace in JSON string. 
        // Better approach: Parse JSON, traverse object, find values starting with "data:", upload, replace.
        
        const traverseAndUpload = async (obj) => {
            if (!obj) return obj;
            if (typeof obj === 'string') {
                if (obj.startsWith('data:')) {
                    // It's a base64 string
                    try {
                        // Convert to file
                        const res = await fetch(obj);
                        const blob = await res.blob();
                        const ext = obj.split(';')[0].split('/')[1];
                        const file = new File([blob], `migrated_file_${Date.now()}.${ext}`, { type: blob.type });
                        
                        // Determine path based on type
                        const path = blob.type.includes('pdf') ? 'materials/pdfs' : 
                                     blob.type.includes('audio') ? 'materials/audio' : 'materials/images';
                        
                        addLog(`☁️ Mengupload file ${ext}...`, 'info');
                        const url = await storageService.uploadFile(file, path);
                        return url;
                    } catch (e) {
                        addLog(`⚠️ Gagal konversi file Base64: ${e.message}`, 'warning');
                        return obj; // Keep original if fail
                    }
                }
                return obj;
            }
            
            if (Array.isArray(obj)) {
                return Promise.all(obj.map(item => traverseAndUpload(item)));
            }
            
            if (typeof obj === 'object') {
                const newObj = {};
                for (const key in obj) {
                    newObj[key] = await traverseAndUpload(obj[key]);
                }
                return newObj;
            }
            
            return obj;
        };

        return traverseAndUpload(contentString);
    };

    const migrateLessons = async (topics) => {
        addLog(`🔄 Memulai Migrasi Materi (${topics.length} Topik)...`, 'info');
        let count = 0;
        
        for (const topic of topics) {
            const key = `arp_materials_${topic.id}`;
            const localContent = localStorage.getItem(key);
            
            if (localContent) {
                try {
                    addLog(`📄 Memproses ${topic.title}...`, 'info');
                    let parsed = JSON.parse(localContent);
                    
                    // PRE-PROCESS: Upload Base64 to Storage
                    parsed = await processBase64(parsed);
                    
                    // Upload to Firestore
                    await setDoc(doc(db, 'lessons', topic.id), { stages: parsed }); 
                    
                    // Update LocalStorage
                    localStorage.setItem(key, JSON.stringify(parsed));
                    
                    count++;
                } catch (e) {
                    addLog(`❌ Gagal topik ${topic.id}: ${e.message}`, 'error');
                }
            }
            setProgress(Math.round(((count) / topics.length) * 100));
        }
        addLog(`✅ Selesai! ${count} materi berhasil dimigrasikan.`, 'success');
    };

    const startMigration = async () => {
        if (isMigrating) return;
        setIsMigrating(true);
        setLogs([]);
        setProgress(0);

        try {
            await migrateConfigs();
            await migratePrograms();
            const topics = await migrateCurriculum();
            if (topics.length > 0) {
                await migrateLessons(topics);
            }
            addLog('🎉 SEMUA MIGRASI SELESAI!', 'success');
        } catch (e) {
            addLog(`❌ Error Fatal: ${e.message}`, 'error');
        } finally {
            setIsMigrating(false);
        }
    };

    const scanForBase64 = async () => {
        addLog('🔍 Memindai LocalStorage untuk file Base64...', 'info');
        let totalBase64 = 0;
        let totalSize = 0;

        const scanValue = (val) => {
            if (typeof val === 'string' && val.startsWith('data:')) {
                totalBase64++;
                totalSize += val.length;
                return;
            }
            if (Array.isArray(val)) val.forEach(scanValue);
            else if (typeof val === 'object' && val !== null) Object.values(val).forEach(scanValue);
        };

        // Scan Lessons
        const localCurr = localStorage.getItem('arp_curriculum');
        if (localCurr) {
            const topics = JSON.parse(localCurr);
            for (const topic of topics) {
                const content = localStorage.getItem(`arp_materials_${topic.id}`);
                if (content) scanValue(JSON.parse(content));
            }
        }

        // Scan Configs
        ['arp_home_config', 'arp_about_config', 'arp_profile_config'].forEach(key => {
             const val = localStorage.getItem(key);
             if (val) scanValue(JSON.parse(val));
        });

        addLog(`📊 Hasil Scan: Ditemukan ${totalBase64} file Base64.`, 'info');
        addLog(`📦 Estimasi Ukuran Total: ${(totalSize / 1024 / 1024).toFixed(2)} MB.`, 'info');
        
        if (totalBase64 === 0) {
            addLog('✅ Tidak ada file yang perlu di-upload (Mungkin sudah bersih atau tidak ada file).', 'success');
        } else {
            addLog('⚠️ Silakan klik "Mulai Migrasi" untuk meng-upload file ini.', 'warning');
        }
    };

    // === CLEANUP HANDLERS ===
    
    const handleClearAllData = async () => {
        const confirmed = await confirm({
            title: '⚠️ Hapus Semua Data?',
            message: 'Ini akan menghapus SEMUA data dari LocalStorage dan Firestore. Tindakan ini TIDAK BISA dibatalkan!',
            confirmText: 'Ya, Hapus Semua',
            cancelText: 'Batal',
            type: 'danger'
        });
        
        if (!confirmed) return;
        
        setIsCleaningUp(true);
        addLog('🗑️ Memulai pembersihan total...', 'warning');
        
        try {
            const result = await cleanupService.clearAllData();
            
            addLog(`✅ LocalStorage: ${result.localStorage.itemsCleared} item dihapus`, 'success');
            
            Object.entries(result.firestore).forEach(([collection, data]) => {
                if (data.success) {
                    addLog(`✅ Firestore ${collection}: ${data.count} dokumen dihapus`, 'success');
                } else {
                    addLog(`❌ Firestore ${collection}: ${data.error}`, 'error');
                }
            });
            
            toast.success('Semua data berhasil dihapus!');
            addLog('🎉 Pembersihan selesai! Database sekarang kosong.', 'success');
        } catch (error) {
            addLog(`❌ Error: ${error.message}`, 'error');
            toast.error('Gagal menghapus data: ' + error.message);
        } finally {
            setIsCleaningUp(false);
        }
    };
    
    const handleClearLocalStorage = async () => {
        const confirmed = await confirm({
            title: 'Hapus LocalStorage?',
            message: 'Ini akan menghapus semua data cache dari browser Anda.',
            confirmText: 'Ya, Hapus',
            cancelText: 'Batal'
        });
        
        if (!confirmed) return;
        
        setIsCleaningUp(true);
        addLog('🗑️ Membersihkan LocalStorage...', 'info');
        
        try {
            const count = cleanupService.clearLocalStorage();
            addLog(`✅ ${count} item dihapus dari LocalStorage`, 'success');
            toast.success(`${count} item cache dihapus`);
        } catch (error) {
            addLog(`❌ Error: ${error.message}`, 'error');
            toast.error('Gagal menghapus LocalStorage');
        } finally {
            setIsCleaningUp(false);
        }
    };
    
    const handleClearFirestore = async () => {
        const confirmed = await confirm({
            title: '⚠️ Hapus Semua Data Firestore?',
            message: 'Ini akan menghapus SEMUA data dari database cloud. Tindakan ini TIDAK BISA dibatalkan!',
            confirmText: 'Ya, Hapus Semua',
            cancelText: 'Batal',
            type: 'danger'
        });
        
        if (!confirmed) return;
        
        setIsCleaningUp(true);
        addLog('🗑️ Membersihkan Firestore...', 'warning');
        
        try {
            const results = await cleanupService.clearAllFirestoreData();
            
            Object.entries(results).forEach(([collection, data]) => {
                if (data.success) {
                    addLog(`✅ ${collection}: ${data.count} dokumen dihapus`, 'success');
                } else {
                    addLog(`❌ ${collection}: ${data.error}`, 'error');
                }
            });
            
            toast.success('Semua data Firestore berhasil dihapus!');
        } catch (error) {
            addLog(`❌ Error: ${error.message}`, 'error');
            toast.error('Gagal menghapus Firestore');
        } finally {
            setIsCleaningUp(false);
        }
    };
    
    const handleClearSettings = async () => {
        const confirmed = await confirm({
            title: 'Hapus Data Settings?',
            message: 'Ini akan menghapus semua konfigurasi (home, about, profile, font, dll).',
            confirmText: 'Ya, Hapus',
            cancelText: 'Batal'
        });
        
        if (!confirmed) return;
        
        setIsCleaningUp(true);
        addLog('🗑️ Menghapus collection settings...', 'info');
        
        try {
            const result = await cleanupService.clearSettingsOnly();
            if (result.success) {
                addLog(`✅ ${result.count} dokumen settings dihapus`, 'success');
                toast.success('Settings berhasil dihapus');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            addLog(`❌ Error: ${error.message}`, 'error');
            toast.error('Gagal menghapus settings');
        } finally {
            setIsCleaningUp(false);
        }
    };
    
    const handleClearLessons = async () => {
        const confirmed = await confirm({
            title: 'Hapus Semua Materi?',
            message: 'Ini akan menghapus semua konten materi pembelajaran dari database.',
            confirmText: 'Ya, Hapus',
            cancelText: 'Batal'
        });
        
        if (!confirmed) return;
        
        setIsCleaningUp(true);
        addLog('🗑️ Menghapus collection lessons...', 'info');
        
        try {
            const result = await cleanupService.clearLessonsOnly();
            if (result.success) {
                addLog(`✅ ${result.count} dokumen lessons dihapus`, 'success');
                toast.success('Materi berhasil dihapus');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            addLog(`❌ Error: ${error.message}`, 'error');
            toast.error('Gagal menghapus materi');
        } finally {
            setIsCleaningUp(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 pb-20 space-y-8">
            <div className="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] p-8 shadow-xl">
                {/* Header ... */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center text-teal-600">
                        <Database className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--color-text-main)]">Migrasi Database & Cloud</h1>
                        <p className="text-[var(--color-text-muted)]">Pindahkan semua data dari Browser (Offline) ke Firebase (Online).</p>
                    </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-8 flex gap-3">
                    <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                    <div className="text-sm text-amber-800 dark:text-amber-200">
                        <strong>Penting:</strong> Proses ini akan membaca data LocalStorage Anda, mengupload gambar/PDF ke Firebase Storage, dan menyimpan teks ke Firestore. <br/>
                        Pastikan koneksi internet stabil. Jangan tutup halaman ini sampai selesai.
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-center gap-4 mb-8">
                    <button 
                        onClick={scanForBase64}
                        disabled={isMigrating}
                        className="px-6 py-4 rounded-xl font-bold border-2 border-teal-600 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all flex items-center justify-center gap-2 w-full md:w-auto"
                    >
                        <UploadCloud className="w-5 h-5" />
                        Cek File Dulu (Scan)
                    </button>

                    <button 
                        onClick={startMigration}
                        disabled={isMigrating}
                        className={`
                            px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg transition-all w-full md:w-auto
                            ${isMigrating 
                                ? 'bg-gray-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed' 
                                : 'bg-teal-600 text-white hover:bg-teal-700 hover:scale-[1.02] active:scale-95'}
                        `}
                    >
                        {isMigrating ? (
                            <>
                                <div className="w-6 h-6 border-4 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                Sedang Memproses ({progress}%)...
                            </>
                        ) : (
                            <>
                                <UploadCloud className="w-6 h-6" />
                                Mulai Migrasi Sekarang
                            </>
                        )}
                    </button>
                </div>

                {/* Logs Console */}
                <div className="bg-gray-900 rounded-xl p-4 h-96 overflow-y-auto font-mono text-xs border border-gray-800 shadow-inner">
                    {logs.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600">
                            <Play className="w-12 h-12 mb-2 opacity-20" />
                            <p>Klik tombol di atas untuk memulai...</p>
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            {logs.map((log, i) => (
                                <div key={i} className={`flex gap-2 ${
                                    log.type === 'error' ? 'text-red-400' :
                                    log.type === 'success' ? 'text-green-400' :
                                    log.type === 'warning' ? 'text-amber-400' :
                                    'text-blue-300'
                                }`}>
                                    <span className="text-gray-500">[{log.time}]</span>
                                    <span>{log.msg}</span>
                                </div>
                            ))}
                            {/* Auto scroll anchor */}
                            <div className="h-0" ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
                        </div>
                    )}
                </div>
            </div>

            {/* === DATA CLEANUP SECTION === */}
            <div className="bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border)] p-8 shadow-xl">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-red-600">
                        <Trash2 className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--color-text-main)]">Pembersihan Data</h2>
                        <p className="text-[var(--color-text-muted)]">Hapus data lama untuk memulai fresh.</p>
                    </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 flex gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div className="text-sm text-red-800 dark:text-red-200">
                        <strong>Peringatan:</strong> Tindakan pembersihan bersifat PERMANEN dan TIDAK BISA dibatalkan. 
                        Pastikan Anda sudah backup data penting sebelum melanjutkan.
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    {/* Clear All Data */}
                    <button
                        onClick={handleClearAllData}
                        disabled={isCleaningUp || isMigrating}
                        className="p-4 rounded-xl border-2 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
                    >
                        <Trash2 className="w-5 h-5" />
                        Hapus Semua Data
                    </button>

                    {/* Clear LocalStorage */}
                    <button
                        onClick={handleClearLocalStorage}
                        disabled={isCleaningUp || isMigrating}
                        className="p-4 rounded-xl border-2 border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Hapus LocalStorage
                    </button>

                    {/* Clear Firestore */}
                    <button
                        onClick={handleClearFirestore}
                        disabled={isCleaningUp || isMigrating}
                        className="p-4 rounded-xl border-2 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
                    >
                        <Database className="w-5 h-5" />
                        Hapus Firestore
                    </button>

                    {/* Clear Settings */}
                    <button
                        onClick={handleClearSettings}
                        disabled={isCleaningUp || isMigrating}
                        className="p-4 rounded-xl border-2 border-amber-600 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
                    >
                        <FileText className="w-5 h-5" />
                        Hapus Settings
                    </button>

                    {/* Clear Lessons */}
                    <button
                        onClick={handleClearLessons}
                        disabled={isCleaningUp || isMigrating}
                        className="p-4 rounded-xl border-2 border-amber-600 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold md:col-span-2"
                    >
                        <BookOpen className="w-5 h-5" />
                        Hapus Materi
                    </button>
                </div>

                {isCleaningUp && (
                    <div className="mt-6 flex items-center justify-center gap-3 text-[var(--color-text-muted)]">
                        <div className="w-5 h-5 border-4 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        <span>Sedang membersihkan data...</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MigrationTools;
