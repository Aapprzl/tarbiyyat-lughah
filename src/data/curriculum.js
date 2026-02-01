/**
 * Core Data Structure for Arabic Learning Curriculum
 * Based on the structure of: https://sites.google.com/view/maria-ulfah-syarif/materi
 */

export const curriculum = [
  {
    id: "materi-dasar",
    title: "Materi Dasar (Pengenalan)",
    icon: "BookOpen",
    topics: [
      { id: "huruf-hijaiyah", title: "Huruf Hijaiyah", type: "basic" },
      { id: "al-kalimah", title: "Al-Kalimah (Kata)", type: "basic" },
    ],
  },
  {
    id: "isim",
    title: "Isim (Kata Benda)",
    icon: "Box",
    topics: [
      {
        id: "muzakkar-muannats",
        title: "Muzakar & Muannats (Gender)",
        type: "grammar",
      },
      {
        id: "mufrod-mutsanna-jamak",
        title: "Mufrod, Mutsanna & Jamak",
        type: "grammar",
      },
      { id: "nakirah-marifah", title: "Nakirah & Ma'rifah", type: "grammar" },
      { id: "dhomir", title: "Isim Dhomir (Kata Ganti)", type: "grammar" },
      { id: "isyarah", title: "Isim Isyarah (Kata Tunjuk)", type: "grammar" },
      { id: "maushul", title: "Isim Maushul (Kata Sambung)", type: "grammar" },
    ],
  },
  {
    id: "fiil",
    title: "Fi'il (Kata Kerja)",
    icon: "Activity",
    topics: [
      { id: "fiil-madhi", title: "Fi'il Madhi (Lampau)", type: "grammar" },
      {
        id: "fiil-mudhari",
        title: "Fi'il Mudhari (Sekarang)",
        type: "grammar",
      },
      { id: "fiil-amr", title: "Fi'il Amr (Perintah)", type: "grammar" },
      { id: "shahih-mutall", title: "Fi'il Shahih & Mu'tal", type: "grammar" },
      {
        id: "lazim-mutaaddi",
        title: "Fi'il Lazim & Muta'addi",
        type: "grammar",
      },
    ],
  },
  {
    id: "huruf",
    title: "Huruf (Partikel)",
    icon: "Hash",
    topics: [
      { id: "huruf-jar", title: "Huruf Jar", type: "grammar" },
      { id: "huruf-nashob", title: "Huruf Nashob", type: "grammar" },
      { id: "huruf-jazm", title: "Huruf Jazm", type: "grammar" },
    ],
  },
];

export const specialPrograms = [
  { id: "karrona", title: "Karrona", desc: "Metode Spesial" },
  { id: "afaik", title: "Afaik", desc: "Program Lanjutan" },
  { id: "qiswakh", title: "Qiswakh", desc: "Kisah & Sejarah" },
];
