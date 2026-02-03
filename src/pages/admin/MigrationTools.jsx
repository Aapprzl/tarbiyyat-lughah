import React, { useState } from 'react';
import { contentService } from '../../services/contentService';
import { storageService } from '../../services/storageService';
import { cleanupService } from '../../services/cleanupService';
import { db } from '../../firebaseConfig';
import { doc, setDoc, writeBatch, collection } from 'firebase/firestore';
import { Database, UploadCloud, CheckCircle, AlertTriangle, Play, FileText, Image as ImageIcon, Trash2, RefreshCw, BookOpen, ShieldAlert, Activity, Cpu, Sparkles, Terminal } from 'lucide-react';
import { useConfirm, useToast } from '../../components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

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
            { key: 'arp_home_config', path: 'settings/home_config', name: 'Home Config' },
            { key: 'arp_about_config', path: 'settings/about_config', name: 'About Config' },
            { key: 'arp_profile_config', path: 'settings/profile_config', name: 'Profile Config' },
            { key: 'arp_font_config', path: 'settings/font_config', name: 'Font Config' }
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
            await setDoc(doc(db, 'settings', 'curriculum'), { items: parsed });
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

                 await setDoc(doc(db, 'settings', 'special_programs'), { items: parsed });
                 
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
            
            // Debug: Log what we're looking for
            addLog(`🔍 Mencari: ${key}...`, 'info');
            
            if (localContent) {
                try {
                    addLog(`📄 Memproses ${topic.title}...`, 'info');
                    let parsed = JSON.parse(localContent);
                    
                    // PRE-PROCESS: Upload Base64 to Storage
                    parsed = await processBase64(parsed);
                    
                    // Upload to Firestore
                    await setDoc(doc(db, 'lessons', topic.id), { content: JSON.stringify(parsed) }); 
                    
                    // Update LocalStorage
                    localStorage.setItem(key, JSON.stringify(parsed));
                    
                    count++;
                } catch (e) {
                    addLog(`❌ Gagal topik ${topic.id}: ${e.message}`, 'error');
                }
            } else {
                addLog(`⚠️ Tidak ditemukan: ${key}`, 'warning');
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
        const confirmed = await confirm(
            'Ini akan menghapus SEMUA data dari LocalStorage dan Firestore. Tindakan ini TIDAK BISA dibatalkan!',
            '⚠️ Hapus Semua Data?'
        );
        
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
            
            // Reload page after 2 seconds to re-fetch from Firestore
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            addLog(`❌ Error: ${error.message}`, 'error');
            toast.error('Gagal menghapus data: ' + error.message);
            setIsCleaningUp(false);
        }
    };
    
    const handleClearLocalStorage = async () => {
        const confirmed = await confirm(
            'Ini akan menghapus semua data cache dari browser Anda.',
            'Hapus LocalStorage?'
        );
        
        if (!confirmed) return;
        
        setIsCleaningUp(true);
        addLog('🗑️ Membersihkan LocalStorage...', 'info');
        
        try {
            const count = cleanupService.clearLocalStorage();
            addLog(`✅ ${count} item dihapus dari LocalStorage`, 'success');
            toast.success(`${count} item cache dihapus. Halaman akan reload...`);
            
            // Reload page after 1 second to re-fetch data from Firestore
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            addLog(`❌ Error: ${error.message}`, 'error');
            toast.error('Gagal menghapus LocalStorage');
            setIsCleaningUp(false);
        }
    };
    
    const handleClearFirestore = async () => {
        const confirmed = await confirm(
            'Ini akan menghapus SEMUA data dari database cloud. Tindakan ini TIDAK BISA dibatalkan!',
            '⚠️ Hapus Semua Data Firestore?'
        );
        
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
            
            // Reload page after 2 seconds
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            addLog(`❌ Error: ${error.message}`, 'error');
            toast.error('Gagal menghapus Firestore');
            setIsCleaningUp(false);
        }
    };
    
    const handleClearSettings = async () => {
        const confirmed = await confirm(
            'Ini akan menghapus semua konfigurasi (home, about, profile, font, dll).',
            'Hapus Data Settings?'
        );
        
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
        const confirmed = await confirm(
            'Ini akan menghapus semua konten materi pembelajaran dari database.',
            'Hapus Semua Materi?'
        );
        
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
        <div className="max-w-6xl mx-auto p-6 pb-32 space-y-12">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-white/5 rounded-[3.5rem] border border-slate-200 dark:border-white/10 p-10 md:p-16 shadow-2xl relative overflow-hidden"
            >
                {/* Background Accent */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-500/5 blur-[100px] rounded-full"></div>

                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-12">
                    <div className="w-20 h-20 bg-teal-500/10 dark:bg-teal-500/5 rounded-[2rem] flex items-center justify-center text-teal-600 shadow-inner">
                        <Database className="w-10 h-10" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-black uppercase tracking-[0.2em] text-[10px] mb-2">
                            <Cpu className="w-3 h-3" /> Core Infrastructure
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Sinkronisasi Cloud</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Migrasikan aset & data dari penyimpanan lokal ke infrastruktur Firebase Online.</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-12">
                         <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-[2.5rem] p-8 mb-12 flex items-start gap-5">
                            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 flex-shrink-0">
                                <ShieldAlert className="w-6 h-6" />
                            </div>
                            <div className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed font-bold">
                                <strong>Protokol Keamanan:</strong> Proses ini akan memindai LocalStorage, mengunggah aset biner ke Firebase Storage, dan menyinkronkan data transaksional ke Firestore. 
                                <span className="block mt-2 opacity-60 font-medium italic">Pastikan stabilitas koneksi jaringan selama proses berlangsung.</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 space-y-8">
                        <div className="flex flex-col gap-4">
                            <button 
                                onClick={scanForBase64}
                                disabled={isMigrating}
                                className="group px-8 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs border-2 border-teal-500/30 text-teal-600 hover:bg-teal-500 hover:text-white transition-all flex items-center justify-center gap-3 w-full shadow-lg shadow-teal-500/5 active:scale-95"
                            >
                                <Activity className="w-5 h-5 transition-transform group-hover:scale-125" />
                                Pindai Aset Lokal
                            </button>

                            <button 
                                onClick={startMigration}
                                disabled={isMigrating}
                                className={cn(
                                    "px-8 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-4 shadow-2xl transition-all w-full relative overflow-hidden group",
                                    isMigrating 
                                        ? 'bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed' 
                                        : 'bg-teal-600 text-white shadow-teal-500/30 hover:bg-teal-700 active:scale-95'
                                )}
                            >
                                {isMigrating ? (
                                    <>
                                        <div className="w-5 h-5 border-3 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
                                        Migrasi ({progress}%)
                                    </>
                                ) : (
                                    <>
                                        <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <UploadCloud className="w-6 h-6 relative z-10" />
                                        <span className="relative z-10">Eksekusi Migrasi</span>
                                        <Sparkles className="w-5 h-5 relative z-10 text-amber-300" />
                                    </>
                                )}
                            </button>
                        </div>
                        
                        <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/5">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Statistik Infrastruktur</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-white dark:bg-black/20 p-4 rounded-2xl border border-slate-100 dark:border-white/10">
                                    <span className="text-xs font-bold text-slate-500 tracking-tight">Firestore Status</span>
                                    <span className="flex items-center gap-2 text-[10px] font-black text-teal-500 uppercase">
                                        <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div> Online
                                    </span>
                                </div>
                                <div className="flex justify-between items-center bg-white dark:bg-black/20 p-4 rounded-2xl border border-slate-100 dark:border-white/10">
                                    <span className="text-xs font-bold text-slate-500 tracking-tight">Storage Latency</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase">Optimized</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-7">
                        {/* Logs Console */}
                        <div className="bg-[#030712] rounded-[3rem] p-8 min-h-[400px] font-mono text-sm border-2 border-slate-800 shadow-2xl relative overflow-hidden group">
                           <div className="absolute top-4 right-6 flex items-center gap-2">
                               <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                               <div className="w-2 h-2 rounded-full bg-amber-500/50"></div>
                               <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                           </div>
                           
                           <div className="flex items-center gap-3 text-slate-600 mb-6 border-b border-slate-800 pb-4">
                               <Terminal className="w-4 h-4" />
                               <span className="text-[10px] font-black uppercase tracking-widest">System Engine Logs</span>
                           </div>

                            <div className="h-[300px] overflow-y-auto custom-scrollbar space-y-2">
                                {logs.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-700">
                                        <Play className="w-12 h-12 mb-4 opacity-10" />
                                        <p className="text-xs uppercase tracking-[0.3em] font-black">Waiting for Command...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-1.5">
                                        {logs.map((log, i) => (
                                            <motion.div 
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                key={i} 
                                                className={cn(
                                                    "flex gap-3 text-xs py-1",
                                                    log.type === 'error' ? 'text-red-400 bg-red-500/5 px-2 rounded-lg' :
                                                    log.type === 'success' ? 'text-teal-400' :
                                                    log.type === 'warning' ? 'text-amber-400' :
                                                    'text-indigo-300'
                                                )}
                                            >
                                                <span className="text-slate-700 shrink-0">[{log.time}]</span>
                                                <span className="font-medium">{log.msg}</span>
                                            </motion.div>
                                        ))}
                                        <div className="h-0" ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* === DATA CLEANUP SECTION === */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-white/5 rounded-[4rem] border border-slate-200 dark:border-white/10 p-12 md:p-16 shadow-xl"
            >
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-500/5 rounded-[2rem] flex items-center justify-center text-red-600 shadow-inner">
                            <Trash2 className="w-10 h-10" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Pembersihan Sektor</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Reset state atau hapus permanen data metadata & aset.</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-red-50 dark:bg-red-500/5 px-6 py-3 rounded-full border border-red-100 dark:border-red-500/20">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">High Risk Operations</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Clear All Data */}
                    <button
                        onClick={handleClearAllData}
                        disabled={isCleaningUp || isMigrating}
                        className="p-8 rounded-[2.5rem] border-2 border-red-500/10 hover:border-red-500 hover:bg-red-500/5 group transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-4 text-center"
                    >
                        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                            <Trash2 className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="text-xs font-black uppercase text-red-500 tracking-widest mb-1">Destructive Root</div>
                            <div className="text-[10px] font-bold text-slate-400">Hapus Semua Sektor</div>
                        </div>
                    </button>

                    {/* Clear LocalStorage */}
                    <button
                        onClick={handleClearLocalStorage}
                        disabled={isCleaningUp || isMigrating}
                        className="p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-white/5 hover:border-teal-500 hover:bg-teal-500/5 group transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-4 text-center"
                    >
                        <div className="w-14 h-14 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-teal-500 group-hover:scale-110 transition-all">
                            <RefreshCw className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="text-xs font-black uppercase text-slate-500 group-hover:text-teal-500 tracking-widest mb-1">Reset Cache</div>
                            <div className="text-[10px] font-bold text-slate-400">Lokal Sektor</div>
                        </div>
                    </button>

                    {/* Clear Firestore */}
                    <button
                        onClick={handleClearFirestore}
                        disabled={isCleaningUp || isMigrating}
                        className="p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-white/5 hover:border-red-500 hover:bg-red-500/5 group transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-4 text-center"
                    >
                        <div className="w-14 h-14 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-red-500 group-hover:scale-110 transition-all">
                            <Database className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="text-xs font-black uppercase text-slate-500 group-hover:text-red-500 tracking-widest mb-1">Cloud Purge</div>
                            <div className="text-[10px] font-bold text-slate-400">Firebase Sektor</div>
                        </div>
                    </button>

                    {/* Clear Settings */}
                    <button
                        onClick={handleClearSettings}
                        disabled={isCleaningUp || isMigrating}
                        className="p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-white/5 hover:border-amber-500 hover:bg-amber-500/5 group transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-4 text-center"
                    >
                        <div className="w-14 h-14 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-amber-500 group-hover:scale-110 transition-all">
                            <FileText className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="text-xs font-black uppercase text-slate-500 group-hover:text-amber-500 tracking-widest mb-1">Config Reset</div>
                            <div className="text-[10px] font-bold text-slate-400">Settings Sektor</div>
                        </div>
                    </button>

                    {/* Clear Lessons */}
                    <button
                        onClick={handleClearLessons}
                        disabled={isCleaningUp || isMigrating}
                        className="sm:col-span-2 lg:col-span-2 p-8 rounded-[2.5rem] border-2 border-slate-100 dark:border-white/5 hover:border-teal-500 hover:bg-teal-500/5 group transition-all disabled:opacity-50 disabled:cursor-not-allowed flex flex-row items-center justify-center gap-6"
                    >
                        <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-teal-500 group-hover:scale-110 transition-all">
                            <BookOpen className="w-8 h-8" />
                        </div>
                        <div className="text-left">
                            <div className="text-xs font-black uppercase text-slate-500 group-hover:text-teal-600 tracking-widest mb-1">Curriculum Wipe</div>
                            <div className="text-[10px] font-bold text-slate-400">Hapus Semua Materi & Tahapan</div>
                        </div>
                    </button>
                </div>

                <AnimatePresence>
                    {isCleaningUp && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-12 flex items-center justify-center gap-4 p-4 bg-slate-900 text-white rounded-[1.5rem] shadow-xl"
                        >
                            <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                            <span className="text-xs font-bold uppercase tracking-widest">Purging system data...</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default MigrationTools;
