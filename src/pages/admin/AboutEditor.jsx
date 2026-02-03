import React, { useState, useEffect } from 'react';
import { contentService } from '../../services/contentService';
import { Save, Info, Mail } from 'lucide-react';
import { useToast } from '../../components/Toast';
import RichTextEditor from '../../components/RichTextEditor';

const AboutEditor = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
     title: '',
     description: '',
     content: '',
     email: '',
     phone: ''
  });
  const toast = useToast();

  useEffect(() => {
    const load = async () => {
      const data = await contentService.getAboutConfig();
      setConfig(data);
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await contentService.saveAboutConfig(config);
    setSaving(false);
    toast.success('Halaman Tentang Kami berhasil disimpan!');
  };

  if (loading) return <div className="p-8 text-center">Memuat...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-main)] flex items-center">
          <Info className="w-8 h-8 mr-3 text-teal-600" />
          Editor Tentang Kami
        </h1>
        <p className="text-[var(--color-text-muted)] mt-1">Kelola konten halaman profil/tentang kami.</p>
      </div>

      <form onSubmit={handleSave} className="bg-[var(--color-bg-card)] rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden p-6 space-y-6">
           
           {/* Header Info */}
           <div className="grid md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-sm font-medium text-[var(--color-text-main)] mb-2">Judul Halaman</label>
                 <input 
                   type="text" 
                   value={config.title}
                   onChange={(e) => setConfig({...config, title: e.target.value})}
                   className="w-full p-3 border border-[var(--color-border)] bg-[var(--color-bg-muted)] text-[var(--color-text-main)] rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-[var(--color-text-main)] mb-2">Deskripsi Singkat (Header)</label>
                 <input 
                   type="text" 
                   value={config.description}
                   onChange={(e) => setConfig({...config, description: e.target.value})}
                   className="w-full p-3 border border-[var(--color-border)] bg-[var(--color-bg-muted)] text-[var(--color-text-main)] rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                 />
               </div>
           </div>

           {/* Main Content with Rich Text Editor */}
           <div>
             <label className="block text-sm font-medium text-[var(--color-text-main)] mb-2">Isi Konten</label>
             <RichTextEditor
               value={config.content}
               onChange={(newContent) => setConfig({...config, content: newContent})}
               placeholder="Tulis konten di sini... Gunakan toolbar untuk memformat teks."
             />
             <p className="text-xs text-[var(--color-text-muted)] mt-2">
               Gunakan toolbar di atas untuk memformat teks. Format akan langsung terlihat saat Anda mengetik.
             </p>
           </div>

           {/* Contact Info */}
           <div className="pt-6 border-t border-[var(--color-border)]">
               <h3 className="font-bold text-[var(--color-text-main)] mb-4 flex items-center">
                   <Mail className="w-4 h-4 mr-2" />
                   Kontak
               </h3>
               <div className="grid md:grid-cols-2 gap-6">
                   <div>
                        <label className="block text-sm font-medium text-[var(--color-text-main)] mb-2">Email</label>
                        <input 
                        type="text" 
                        value={config.email}
                        onChange={(e) => setConfig({...config, email: e.target.value})}
                        className="w-full p-3 border border-[var(--color-border)] bg-[var(--color-bg-muted)] text-[var(--color-text-main)] rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                   </div>
                   <div>
                        <label className="block text-sm font-medium text-[var(--color-text-main)] mb-2">Telepon / WhatsApp</label>
                        <input 
                        type="text" 
                        value={config.phone}
                        onChange={(e) => setConfig({...config, phone: e.target.value})}
                        className="w-full p-3 border border-[var(--color-border)] bg-[var(--color-bg-muted)] text-[var(--color-text-main)] rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                   </div>
               </div>
           </div>

           <div className="pt-6 flex justify-end">
              <button 
                type="submit" 
                disabled={saving}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-bold flex items-center disabled:opacity-50"
              >
                <Save className="w-5 h-5 mr-2" />
                Simpan
              </button>
           </div>
      </form>
    </div>
  );
};

export default AboutEditor;
