import React, { useEffect, useState } from 'react';
import { User, Mail, Globe, Linkedin, Instagram, FileText, ArrowLeft, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { contentService } from '../services/contentService';
import PdfViewer from '../components/PdfViewer';

const Profile = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
             const data = await contentService.getProfileConfig();
             console.log('[Profile] Loaded config:', data); // Debug
             setConfig(data);
             setLoading(false);
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
            </div>
        );
    }

    if (!config || (!config.name && !config.bio)) {
         return (
             <div className="text-center py-20 text-[var(--color-text-muted)]">
                 <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
                 <h2 className="text-xl font-bold">Profil Belum Tersedia</h2>
                 <p className="mt-2 text-sm">Informasi profil pembuat belum ditambahkan.</p>
                 <Link to="/" className="inline-block mt-6 text-[var(--color-primary)] hover:underline">Kembali ke Beranda</Link>
             </div>
         );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 pb-24">
             {/* Header */}
             <div className="flex items-center text-sm text-[var(--color-text-muted)] mb-8 py-4">
                <Link to="/" className="hover:text-[var(--color-primary)] flex items-center transition-colors">
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Beranda
                </Link>
                <span className="mx-2 opacity-30 select-none">/</span>
                <span className="text-[var(--color-text-main)] font-semibold">Profil</span>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {/* Left Profile Card */}
                 <div className="md:col-span-1">
                     <div className="bg-[var(--color-bg-card)] rounded-3xl shadow-lg border border-[var(--color-border)] p-8 text-center sticky top-24">
                          <div className="w-32 h-32 mx-auto rounded-full p-1 border-2 border-[var(--color-primary)] mb-6 shadow-sm">
                               {config.photoUrl ? (
                                   <img src={config.photoUrl} alt={config.name} className="w-full h-full rounded-full object-cover" />
                               ) : (
                                   <div className="w-full h-full rounded-full bg-[var(--color-bg-muted)] flex items-center justify-center text-[var(--color-text-muted)]">
                                       <User className="w-12 h-12" />
                                   </div>
                               )}
                          </div>
                          
                          <h1 className="text-2xl font-bold text-[var(--color-text-main)] mb-1">{config.name}</h1>
                          <p className="text-[var(--color-text-muted)] text-sm mb-6">{config.title || 'Creator'}</p>
                          
                          <div className="space-y-3">
                               {config.email && (
                                   <a href={`mailto:${config.email}`} className="flex items-center justify-center gap-2 p-2 rounded-lg bg-[var(--color-bg-muted)] hover:bg-[var(--color-bg-hover)] text-sm text-[var(--color-text-main)] transition-colors">
                                       <Mail className="w-4 h-4" />
                                       <span>Email</span>
                                   </a>
                               )}
                               
                               <div className="flex justify-center gap-3 mt-4">
                                   {config.socials?.instagram && (
                                       <a href={config.socials.instagram} target="_blank" rel="noreferrer" className="p-2 bg-pink-50 dark:bg-pink-900/20 text-pink-600 rounded-full hover:bg-pink-100 transition-colors">
                                           <Instagram className="w-5 h-5" />
                                       </a>
                                   )}
                                   {config.socials?.linkedin && (
                                       <a href={config.socials.linkedin} target="_blank" rel="noreferrer" className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
                                           <Linkedin className="w-5 h-5" />
                                       </a>
                                   )}
                                   {config.socials?.website && (
                                       <a href={config.socials.website} target="_blank" rel="noreferrer" className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                                           <Globe className="w-5 h-5" />
                                       </a>
                                   )}
                               </div>
                          </div>
                     </div>
                 </div>

                 {/* Right Content */}
                 <div className="md:col-span-2 space-y-8">
                     {/* Bio */}
                     <div className="bg-[var(--color-bg-card)] rounded-3xl shadow-sm border border-[var(--color-border)] p-8">
                          <h2 className="text-xl font-bold text-[var(--color-text-main)] mb-4 flex items-center">
                               <User className="w-5 h-5 mr-2 text-[var(--color-primary)]" />
                               Tentang Saya
                          </h2>
                          <div className="prose prose-teal dark:prose-invert max-w-none text-[var(--color-text-main)] whitespace-pre-wrap leading-relaxed opacity-90">
                              {config.bio || 'Tidak ada deskripsi.'}
                          </div>
                     </div>

                     {/* PDF Preview */}
                     {config.pdfUrl && (
                         <div className="bg-[var(--color-bg-card)] rounded-3xl shadow-sm border border-[var(--color-border)] p-8">
                              <div className="flex justify-between items-center mb-6">
                                  <h2 className="text-xl font-bold text-[var(--color-text-main)] flex items-center">
                                       <FileText className="w-5 h-5 mr-2 text-red-500" />
                                       Dokumen Profil
                                  </h2>
                                  <a href={config.pdfUrl} download="Profil-Creator.pdf" className="flex items-center text-sm font-bold text-[var(--color-primary)] hover:underline">
                                      <Download className="w-4 h-4 mr-1" />
                                      Download
                                  </a>
                              </div>
                              <div className="rounded-xl overflow-hidden border border-[var(--color-border)]">
                                   <PdfViewer src={config.pdfUrl} height={600} />
                              </div>
                         </div>
                     )}
                 </div>
             </div>
        </div>
    );
};

export default Profile;
