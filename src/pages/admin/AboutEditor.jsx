import React, { useState, useEffect, useRef } from 'react';
import { contentService } from '../../services/contentService';
import { Save, Info, Mail, Bold, Italic, List, Link as LinkIcon, Heading, Quote } from 'lucide-react';
import { useToast } from '../../components/Toast';

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
  const textareaRef = useRef(null);
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

  const insertFormat = (prefix, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = config.content;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    const newText = before + prefix + selection + suffix + after;
    
    setConfig({ ...config, content: newText });

    // Restore focus and cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
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

           {/* Main Content with Toolbar */}
           <div>
             <label className="block text-sm font-medium text-[var(--color-text-main)] mb-2">Isi Konten</label>
             <div className="border border-[var(--color-border)] rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500">
                {/* Toolbar */}
                <div className="bg-[var(--color-bg-muted)] border-b border-[var(--color-border)] p-2 flex space-x-2">
                    <button type="button" onClick={() => insertFormat('**', '**')} className="p-2 hover:bg-[var(--color-bg-hover)] rounded text-[var(--color-text-main)]" title="Tebal">
                        <Bold className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => insertFormat('*', '*')} className="p-2 hover:bg-[var(--color-bg-hover)] rounded text-[var(--color-text-main)]" title="Miring">
                        <Italic className="w-4 h-4" />
                    </button>
                    <div className="w-px bg-gray-300 mx-2"></div>
                    <button type="button" onClick={() => insertFormat('### ')} className="p-2 hover:bg-[var(--color-bg-hover)] rounded text-[var(--color-text-main)]" title="Judul (Heading)">
                        <Heading className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => insertFormat('- ')} className="p-2 hover:bg-[var(--color-bg-hover)] rounded text-[var(--color-text-main)]" title="List/Daftar">
                        <List className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => insertFormat('> ')} className="p-2 hover:bg-[var(--color-bg-hover)] rounded text-[var(--color-text-main)]" title="Kutipan">
                        <Quote className="w-4 h-4" />
                    </button>
                    <div className="w-px bg-gray-300 mx-2"></div>
                    <button type="button" onClick={() => insertFormat('[', '](url)')} className="p-2 hover:bg-[var(--color-bg-hover)] rounded text-[var(--color-text-main)]" title="Link/Tautan">
                        <LinkIcon className="w-4 h-4" />
                    </button>
                </div>
                
                <textarea 
                  ref={textareaRef}
                  value={config.content}
                  onChange={(e) => setConfig({...config, content: e.target.value})}
                  rows="15"
                  className="w-full p-4 outline-none font-mono text-sm leading-relaxed resize-y bg-[var(--color-bg-card)] text-[var(--color-text-main)] placeholder-[var(--color-text-muted)]"
                  placeholder="Tulis konten di sini..."
                />
             </div>
             <p className="text-xs text-[var(--color-text-muted)] mt-2">Gunakan toolbar di atas untuk memformat teks.</p>
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
