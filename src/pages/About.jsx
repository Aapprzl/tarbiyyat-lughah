import React, { useEffect, useState } from 'react';
import { contentService } from '../services/contentService';
import { Mail, Phone, Info } from 'lucide-react';

const About = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        const load = async () => {
            const config = await contentService.getAboutConfig();
            setData(config);
        };
        load();
    }, []);

    if (!data) return null;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-br from-teal-600 to-teal-700 dark:from-teal-800 dark:to-teal-950 text-white rounded-3xl p-8 md:p-12 mb-12 shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 font-arabic">{data.title}</h1>
                    <p className="text-teal-100 dark:text-teal-200 text-lg leading-relaxed max-w-2xl">{data.description}</p>
                </div>
                <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
                    <Info className="w-64 h-64" />
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-8">
                    <div 
                        className="bg-[var(--color-bg-card)] rounded-2xl p-8 shadow-sm border border-[var(--color-border)] prose prose-lg prose-teal dark:prose-invert max-w-none text-[var(--color-text-main)] about-content"
                        dangerouslySetInnerHTML={{ __html: data.content }}
                    />
                </div>

                <style>{`
                    .about-content a {
                        color: #0d9488 !important;
                        text-decoration: underline !important;
                        font-weight: 500;
                    }
                    .about-content a:hover {
                        color: #0f766e !important;
                    }
                `}</style>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-amber-100/30 dark:bg-amber-900/10 rounded-2xl p-6 border border-amber-200 dark:border-amber-900/30">
                        <h3 className="font-bold text-amber-800 dark:text-amber-400 mb-4 text-lg">Hubungi Kami</h3>
                        <ul className="space-y-4">
                            <li className="flex items-center text-amber-700 dark:text-amber-300">
                                <Mail className="w-5 h-5 mr-3" />
                                <span className="text-sm">{data.email}</span>
                            </li>
                            <li className="flex items-center text-amber-700 dark:text-amber-300">
                                <Phone className="w-5 h-5 mr-3" />
                                <span className="text-sm">{data.phone}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
