export interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
  startingJuz: number;
}

export interface AyahItem {
  numberInSurah: number;
  globalNumber: number;
  textUthmani: string;
  translation: string;
  juz: number;
  page?: number;
  audioUrl?: string;
  tafsir?: string;
  words?: {
    arabic: string;
    translation: string;
    transliteration: string;
  }[];
}

export interface Reciter {
  id: number;
  name: string;
  style: string;
  subfolder: string;
}

export const RECITERS: Reciter[] = [
  { id: 7, name: 'Mishari Rashid al-Afasy', style: 'Murattal', subfolder: 'Alafasy_128kbps' },
  { id: 1, name: 'AbdulBaset AbdulSamad', style: 'Mujawwad', subfolder: 'Abdul_Basit_Mujawwad_128kbps' },
  { id: 2, name: 'Mahmoud Khalil Al-Husary', style: 'Murattal', subfolder: 'Husary_128kbps' },
  { id: 3, name: 'Saad Al-Ghamdi', style: 'Murattal', subfolder: 'Ghamadi_40kbps' },
  { id: 4, name: 'Abu Bakr Al-Shatri', style: 'Murattal', subfolder: 'Abu_Bakr_Ash-Shaatree_128kbps' },
];

export const SURAHS_LIST: SurahMeta[] = [
  { number: 1, name: 'الفاتحة', englishName: 'Al-Fatihah', englishNameTranslation: 'The Opening', numberOfAyahs: 7, revelationType: 'Meccan', startingJuz: 1 },
  { number: 2, name: 'البقرة', englishName: 'Al-Baqarah', englishNameTranslation: 'The Cow', numberOfAyahs: 286, revelationType: 'Medinan', startingJuz: 1 },
  { number: 3, name: 'آل عمران', englishName: "Ali 'Imran", englishNameTranslation: 'Family of Imran', numberOfAyahs: 200, revelationType: 'Medinan', startingJuz: 3 },
  { number: 4, name: 'النساء', englishName: "An-Nisa'", englishNameTranslation: 'The Women', numberOfAyahs: 176, revelationType: 'Medinan', startingJuz: 4 },
  { number: 5, name: 'المائدة', englishName: "Al-Ma'idah", englishNameTranslation: 'The Table Spread', numberOfAyahs: 120, revelationType: 'Medinan', startingJuz: 6 },
  { number: 6, name: 'الأنعام', englishName: "Al-An'am", englishNameTranslation: 'The Cattle', numberOfAyahs: 165, revelationType: 'Meccan', startingJuz: 7 },
  { number: 7, name: 'الأعراف', englishName: "Al-A'raf", englishNameTranslation: 'The Heights', numberOfAyahs: 206, revelationType: 'Meccan', startingJuz: 8 },
  { number: 8, name: 'الأنفال', englishName: 'Al-Anfal', englishNameTranslation: 'The Spoils of War', numberOfAyahs: 75, revelationType: 'Medinan', startingJuz: 9 },
  { number: 9, name: 'التوبة', englishName: 'At-Tawbah', englishNameTranslation: 'The Repentance', numberOfAyahs: 129, revelationType: 'Medinan', startingJuz: 10 },
  { number: 10, name: 'يونس', englishName: 'Yunus', englishNameTranslation: 'Jonah', numberOfAyahs: 109, revelationType: 'Meccan', startingJuz: 11 },
  { number: 11, name: 'هود', englishName: 'Hud', englishNameTranslation: 'Hud', numberOfAyahs: 123, revelationType: 'Meccan', startingJuz: 11 },
  { number: 12, name: 'يوسف', englishName: 'Yusuf', englishNameTranslation: 'Joseph', numberOfAyahs: 111, revelationType: 'Meccan', startingJuz: 12 },
  { number: 13, name: 'الرعد', englishName: "Ar-Ra'd", englishNameTranslation: 'The Thunder', numberOfAyahs: 43, revelationType: 'Medinan', startingJuz: 13 },
  { number: 14, name: 'إبراهيم', englishName: 'Ibrahim', englishNameTranslation: 'Abraham', numberOfAyahs: 52, revelationType: 'Meccan', startingJuz: 13 },
  { number: 15, name: 'الحجر', englishName: 'Al-Hijr', englishNameTranslation: 'The Rocky Tract', numberOfAyahs: 99, revelationType: 'Meccan', startingJuz: 14 },
  { number: 16, name: 'النحل', englishName: 'An-Nahl', englishNameTranslation: 'The Bee', numberOfAyahs: 128, revelationType: 'Meccan', startingJuz: 14 },
  { number: 17, name: 'الإسراء', englishName: 'Al-Isra', englishNameTranslation: 'The Night Journey', numberOfAyahs: 111, revelationType: 'Meccan', startingJuz: 15 },
  { number: 18, name: 'الكهف', englishName: 'Al-Kahf', englishNameTranslation: 'The Cave', numberOfAyahs: 110, revelationType: 'Meccan', startingJuz: 15 },
  { number: 19, name: 'مريم', englishName: 'Maryam', englishNameTranslation: 'Mary', numberOfAyahs: 98, revelationType: 'Meccan', startingJuz: 16 },
  { number: 20, name: 'طه', englishName: 'Taha', englishNameTranslation: 'Ta-Ha', numberOfAyahs: 135, revelationType: 'Meccan', startingJuz: 16 },
  { number: 21, name: 'الأنبياء', englishName: 'Al-Anbiya', englishNameTranslation: 'The Prophets', numberOfAyahs: 112, revelationType: 'Meccan', startingJuz: 17 },
  { number: 22, name: 'الحج', englishName: 'Al-Hajj', englishNameTranslation: 'The Pilgrimage', numberOfAyahs: 78, revelationType: 'Medinan', startingJuz: 17 },
  { number: 23, name: 'المؤمنون', englishName: "Al-Mu'minun", englishNameTranslation: 'The Believers', numberOfAyahs: 118, revelationType: 'Meccan', startingJuz: 18 },
  { number: 24, name: 'النور', englishName: 'An-Nur', englishNameTranslation: 'The Light', numberOfAyahs: 64, revelationType: 'Medinan', startingJuz: 18 },
  { number: 25, name: 'الفرقان', englishName: 'Al-Furqan', englishNameTranslation: 'The Criterion', numberOfAyahs: 77, revelationType: 'Meccan', startingJuz: 18 },
  { number: 26, name: 'الشعراء', englishName: "Ash-Shu'ara", englishNameTranslation: 'The Poets', numberOfAyahs: 227, revelationType: 'Meccan', startingJuz: 19 },
  { number: 27, name: 'النمل', englishName: 'An-Naml', englishNameTranslation: 'The Ant', numberOfAyahs: 93, revelationType: 'Meccan', startingJuz: 19 },
  { number: 28, name: 'القصص', englishName: 'Al-Qasas', englishNameTranslation: 'The Stories', numberOfAyahs: 88, revelationType: 'Meccan', startingJuz: 20 },
  { number: 29, name: 'العنكبوت', englishName: "Al-'Ankabut", englishNameTranslation: 'The Spider', numberOfAyahs: 69, revelationType: 'Meccan', startingJuz: 20 },
  { number: 30, name: 'الروم', englishName: 'Ar-Rum', englishNameTranslation: 'The Romans', numberOfAyahs: 60, revelationType: 'Meccan', startingJuz: 21 },
  { number: 31, name: 'لقمان', englishName: 'Luqman', englishNameTranslation: 'Luqman', numberOfAyahs: 34, revelationType: 'Meccan', startingJuz: 21 },
  { number: 32, name: 'السجدة', englishName: 'As-Sajdah', englishNameTranslation: 'The Prostration', numberOfAyahs: 30, revelationType: 'Meccan', startingJuz: 21 },
  { number: 33, name: 'الأحزاب', englishName: 'Al-Ahzab', englishNameTranslation: 'The Combined Forces', numberOfAyahs: 73, revelationType: 'Medinan', startingJuz: 21 },
  { number: 34, name: 'سبإ', englishName: 'Saba', englishNameTranslation: 'Sheba', numberOfAyahs: 54, revelationType: 'Meccan', startingJuz: 22 },
  { number: 35, name: 'فاطر', englishName: 'Fatir', englishNameTranslation: 'Originator', numberOfAyahs: 45, revelationType: 'Meccan', startingJuz: 22 },
  { number: 36, name: 'يس', englishName: 'Ya-Sin', englishNameTranslation: 'Ya-Sin', numberOfAyahs: 83, revelationType: 'Meccan', startingJuz: 22 },
  { number: 37, name: 'الصافات', englishName: 'As-Saffat', englishNameTranslation: 'Those who set the Ranks', numberOfAyahs: 182, revelationType: 'Meccan', startingJuz: 23 },
  { number: 38, name: 'ص', englishName: 'Sad', englishNameTranslation: 'The Letter Sad', numberOfAyahs: 88, revelationType: 'Meccan', startingJuz: 23 },
  { number: 39, name: 'الزمر', englishName: 'Az-Zumar', englishNameTranslation: 'The Troops', numberOfAyahs: 75, revelationType: 'Meccan', startingJuz: 23 },
  { number: 40, name: 'غافر', englishName: 'Ghafir', englishNameTranslation: 'The Forgiver', numberOfAyahs: 85, revelationType: 'Meccan', startingJuz: 24 },
  { number: 41, name: 'فصلت', englishName: 'Fussilat', englishNameTranslation: 'Explained in Detail', numberOfAyahs: 54, revelationType: 'Meccan', startingJuz: 24 },
  { number: 42, name: 'الشورى', englishName: 'Ash-Shura', englishNameTranslation: 'The Consultation', numberOfAyahs: 53, revelationType: 'Meccan', startingJuz: 25 },
  { number: 43, name: 'الزخرف', englishName: 'Az-Zukhruf', englishNameTranslation: 'The Ornaments of Gold', numberOfAyahs: 89, revelationType: 'Meccan', startingJuz: 25 },
  { number: 44, name: 'الدخان', englishName: 'Ad-Dukhan', englishNameTranslation: 'The Smoke', numberOfAyahs: 59, revelationType: 'Meccan', startingJuz: 25 },
  { number: 45, name: 'الجاثية', englishName: 'Al-Jathiyah', englishNameTranslation: 'The Crouching', numberOfAyahs: 37, revelationType: 'Meccan', startingJuz: 25 },
  { number: 46, name: 'الأحقاف', englishName: 'Al-Ahqaf', englishNameTranslation: 'The Wind-Curved Sandhills', numberOfAyahs: 35, revelationType: 'Meccan', startingJuz: 26 },
  { number: 47, name: 'محمد', englishName: 'Muhammad', englishNameTranslation: 'Muhammad', numberOfAyahs: 38, revelationType: 'Medinan', startingJuz: 26 },
  { number: 48, name: 'الفتح', englishName: 'Al-Fath', englishNameTranslation: 'The Victory', numberOfAyahs: 29, revelationType: 'Medinan', startingJuz: 26 },
  { number: 49, name: 'الحجرات', englishName: 'Al-Hujurat', englishNameTranslation: 'The Rooms', numberOfAyahs: 18, revelationType: 'Medinan', startingJuz: 26 },
  { number: 50, name: 'ق', englishName: 'Qaf', englishNameTranslation: 'The Letter Qaf', numberOfAyahs: 45, revelationType: 'Meccan', startingJuz: 26 },
  { number: 51, name: 'الذاريات', englishName: 'Adh-Dhariyat', englishNameTranslation: 'The Winnowing Winds', numberOfAyahs: 60, revelationType: 'Meccan', startingJuz: 26 },
  { number: 52, name: 'الطور', englishName: 'At-Tur', englishNameTranslation: 'The Mount', numberOfAyahs: 49, revelationType: 'Meccan', startingJuz: 27 },
  { number: 53, name: 'النجم', englishName: 'An-Najm', englishNameTranslation: 'The Star', numberOfAyahs: 62, revelationType: 'Meccan', startingJuz: 27 },
  { number: 54, name: 'القمر', englishName: 'Al-Qamar', englishNameTranslation: 'The Moon', numberOfAyahs: 55, revelationType: 'Meccan', startingJuz: 27 },
  { number: 55, name: 'الرحمن', englishName: 'Ar-Rahman', englishNameTranslation: 'The Beneficent', numberOfAyahs: 78, revelationType: 'Medinan', startingJuz: 27 },
  { number: 56, name: 'الواقعة', englishName: 'Al-Waqi\'ah', englishNameTranslation: 'The Inevitable', numberOfAyahs: 96, revelationType: 'Meccan', startingJuz: 27 },
  { number: 57, name: 'الحديد', englishName: 'Al-Hadid', englishNameTranslation: 'The Iron', numberOfAyahs: 29, revelationType: 'Medinan', startingJuz: 27 },
  { number: 58, name: 'المجادلة', englishName: 'Al-Mujadila', englishNameTranslation: 'The Pleading Woman', numberOfAyahs: 22, revelationType: 'Medinan', startingJuz: 28 },
  { number: 59, name: 'الحشر', englishName: 'Al-Hashr', englishNameTranslation: 'The Exile', numberOfAyahs: 24, revelationType: 'Medinan', startingJuz: 28 },
  { number: 60, name: 'الممتحنة', englishName: 'Al-Mumtahanah', englishNameTranslation: 'She that is to be examined', numberOfAyahs: 13, revelationType: 'Medinan', startingJuz: 28 },
  { number: 61, name: 'الصف', englishName: 'As-Saff', englishNameTranslation: 'The Ranks', numberOfAyahs: 14, revelationType: 'Medinan', startingJuz: 28 },
  { number: 62, name: 'الجمعة', englishName: "Al-Jumu'ah", englishNameTranslation: 'Friday', numberOfAyahs: 11, revelationType: 'Medinan', startingJuz: 28 },
  { number: 63, name: 'المنافقون', englishName: 'Al-Munafiqun', englishNameTranslation: 'The Hypocrites', numberOfAyahs: 11, revelationType: 'Medinan', startingJuz: 28 },
  { number: 64, name: 'التغابن', englishName: 'At-Taghabun', englishNameTranslation: 'The Mutual Disillusion', numberOfAyahs: 18, revelationType: 'Medinan', startingJuz: 28 },
  { number: 65, name: 'الطلاق', englishName: 'At-Talaq', englishNameTranslation: 'The Divorce', numberOfAyahs: 12, revelationType: 'Medinan', startingJuz: 28 },
  { number: 66, name: 'التحريم', englishName: 'At-Tahrim', englishNameTranslation: 'The Prohibition', numberOfAyahs: 12, revelationType: 'Medinan', startingJuz: 28 },
  { number: 67, name: 'الملك', englishName: 'Al-Mulk', englishNameTranslation: 'The Sovereignty', numberOfAyahs: 30, revelationType: 'Meccan', startingJuz: 29 },
  { number: 68, name: 'القلم', englishName: 'Al-Qalam', englishNameTranslation: 'The Pen', numberOfAyahs: 52, revelationType: 'Meccan', startingJuz: 29 },
  { number: 69, name: 'الحاقة', englishName: 'Al-Haqqah', englishNameTranslation: 'The Reality', numberOfAyahs: 52, revelationType: 'Meccan', startingJuz: 29 },
  { number: 70, name: 'المعارج', englishName: "Al-Ma'arij", englishNameTranslation: 'The Ascending Stairways', numberOfAyahs: 44, revelationType: 'Meccan', startingJuz: 29 },
  { number: 71, name: 'نوح', englishName: 'Nuh', englishNameTranslation: 'Noah', numberOfAyahs: 28, revelationType: 'Meccan', startingJuz: 29 },
  { number: 72, name: 'الجن', englishName: 'Al-Jinn', englishNameTranslation: 'The Jinn', numberOfAyahs: 28, revelationType: 'Meccan', startingJuz: 29 },
  { number: 73, name: 'المزمل', englishName: 'Al-Muzzammil', englishNameTranslation: 'The Enshrouded One', numberOfAyahs: 20, revelationType: 'Meccan', startingJuz: 29 },
  { number: 74, name: 'المدثر', englishName: 'Al-Muddaththir', englishNameTranslation: 'The Cloaked One', numberOfAyahs: 56, revelationType: 'Meccan', startingJuz: 29 },
  { number: 75, name: 'القيامة', englishName: 'Al-Qiyamah', englishNameTranslation: 'The Resurrection', numberOfAyahs: 40, revelationType: 'Meccan', startingJuz: 29 },
  { number: 76, name: 'الإنسان', englishName: 'Al-Insan', englishNameTranslation: 'The Human', numberOfAyahs: 31, revelationType: 'Medinan', startingJuz: 29 },
  { number: 77, name: 'المرسلات', englishName: 'Al-Mursalat', englishNameTranslation: 'The Emissaries', numberOfAyahs: 50, revelationType: 'Meccan', startingJuz: 29 },
  { number: 78, name: 'النبإ', englishName: 'An-Naba', englishNameTranslation: 'The Tidings', numberOfAyahs: 40, revelationType: 'Meccan', startingJuz: 30 },
  { number: 79, name: 'النازعات', englishName: "An-Nazi'at", englishNameTranslation: 'Those who drag forth', numberOfAyahs: 46, revelationType: 'Meccan', startingJuz: 30 },
  { number: 80, name: 'عبس', englishName: "'Abasa", englishNameTranslation: 'He Frowned', numberOfAyahs: 42, revelationType: 'Meccan', startingJuz: 30 },
  { number: 81, name: 'التكوير', englishName: 'At-Takwir', englishNameTranslation: 'The Overthrowing', numberOfAyahs: 29, revelationType: 'Meccan', startingJuz: 30 },
  { number: 82, name: 'الانفطار', englishName: 'Al-Infitar', englishNameTranslation: 'The Cleaving', numberOfAyahs: 19, revelationType: 'Meccan', startingJuz: 30 },
  { number: 83, name: 'المطففين', englishName: 'Al-Mutaffifin', englishNameTranslation: 'The Defrauding', numberOfAyahs: 36, revelationType: 'Meccan', startingJuz: 30 },
  { number: 84, name: 'الانشقاق', englishName: 'Al-Inshiqaq', englishNameTranslation: 'The Splitting Open', numberOfAyahs: 25, revelationType: 'Meccan', startingJuz: 30 },
  { number: 85, name: 'البروج', englishName: 'Al-Buruj', englishNameTranslation: 'The Mansions of the Stars', numberOfAyahs: 22, revelationType: 'Meccan', startingJuz: 30 },
  { number: 86, name: 'الطارق', englishName: 'At-Tariq', englishNameTranslation: 'The Morning Star', numberOfAyahs: 17, revelationType: 'Meccan', startingJuz: 30 },
  { number: 87, name: 'الأعلى', englishName: "Al-A'la", englishNameTranslation: 'The Most High', numberOfAyahs: 19, revelationType: 'Meccan', startingJuz: 30 },
  { number: 88, name: 'الغاشية', englishName: 'Al-Ghashiyah', englishNameTranslation: 'The Overwhelming', numberOfAyahs: 26, revelationType: 'Meccan', startingJuz: 30 },
  { number: 89, name: 'الفجر', englishName: 'Al-Fajr', englishNameTranslation: 'The Dawn', numberOfAyahs: 30, revelationType: 'Meccan', startingJuz: 30 },
  { number: 90, name: 'البلد', englishName: 'Al-Balad', englishNameTranslation: 'The City', numberOfAyahs: 20, revelationType: 'Meccan', startingJuz: 30 },
  { number: 91, name: 'الشمس', englishName: 'Ash-Shams', englishNameTranslation: 'The Sun', numberOfAyahs: 15, revelationType: 'Meccan', startingJuz: 30 },
  { number: 92, name: 'الليل', englishName: 'Al-Layl', englishNameTranslation: 'The Night', numberOfAyahs: 21, revelationType: 'Meccan', startingJuz: 30 },
  { number: 93, name: 'الضحى', englishName: 'Ad-Duhaa', englishNameTranslation: 'The Morning Hours', numberOfAyahs: 11, revelationType: 'Meccan', startingJuz: 30 },
  { number: 94, name: 'الشرح', englishName: 'Ash-Sharh', englishNameTranslation: 'The Relief', numberOfAyahs: 8, revelationType: 'Meccan', startingJuz: 30 },
  { number: 95, name: 'التين', englishName: 'At-Tin', englishNameTranslation: 'The Fig', numberOfAyahs: 8, revelationType: 'Meccan', startingJuz: 30 },
  { number: 96, name: 'العلق', englishName: "Al-'Alaq", englishNameTranslation: 'The Clot', numberOfAyahs: 19, revelationType: 'Meccan', startingJuz: 30 },
  { number: 97, name: 'القدر', englishName: 'Al-Qadr', englishNameTranslation: 'The Power', numberOfAyahs: 5, revelationType: 'Meccan', startingJuz: 30 },
  { number: 98, name: 'البينة', englishName: 'Al-Bayyinah', englishNameTranslation: 'The Clear Proof', numberOfAyahs: 8, revelationType: 'Medinan', startingJuz: 30 },
  { number: 99, name: 'الزلزلة', englishName: 'Az-Zalzalah', englishNameTranslation: 'The Earthquake', numberOfAyahs: 8, revelationType: 'Medinan', startingJuz: 30 },
  { number: 100, name: 'العاديات', englishName: "Al-'Adiyat", englishNameTranslation: 'The Courser', numberOfAyahs: 11, revelationType: 'Meccan', startingJuz: 30 },
  { number: 101, name: 'القارعة', englishName: "Al-Qari'ah", englishNameTranslation: 'The Calamity', numberOfAyahs: 11, revelationType: 'Meccan', startingJuz: 30 },
  { number: 102, name: 'التكاثر', englishName: 'At-Takathur', englishNameTranslation: 'The Rivalry in World Increase', numberOfAyahs: 8, revelationType: 'Meccan', startingJuz: 30 },
  { number: 103, name: 'العصر', englishName: "Al-'Asr", englishNameTranslation: 'The Declining Day', numberOfAyahs: 3, revelationType: 'Meccan', startingJuz: 30 },
  { number: 104, name: 'الهمزة', englishName: 'Al-Humazah', englishNameTranslation: 'The Traducer', numberOfAyahs: 9, revelationType: 'Meccan', startingJuz: 30 },
  { number: 105, name: 'الفيل', englishName: 'Al-Fil', englishNameTranslation: 'The Elephant', numberOfAyahs: 5, revelationType: 'Meccan', startingJuz: 30 },
  { number: 106, name: 'قريش', englishName: 'Quraysh', englishNameTranslation: 'Quraysh', numberOfAyahs: 4, revelationType: 'Meccan', startingJuz: 30 },
  { number: 107, name: 'الماعون', englishName: "Al-Ma'un", englishNameTranslation: 'The Small Kindness', numberOfAyahs: 7, revelationType: 'Meccan', startingJuz: 30 },
  { number: 108, name: 'الكوثر', englishName: 'Al-Kawthar', englishNameTranslation: 'The Abundance', numberOfAyahs: 3, revelationType: 'Meccan', startingJuz: 30 },
  { number: 109, name: 'الكافرون', englishName: 'Al-Kafirun', englishNameTranslation: 'The Disbelievers', numberOfAyahs: 6, revelationType: 'Meccan', startingJuz: 30 },
  { number: 110, name: 'النصر', englishName: 'An-Nasr', englishNameTranslation: 'The Divine Support', numberOfAyahs: 3, revelationType: 'Medinan', startingJuz: 30 },
  { number: 111, name: 'المسد', englishName: 'Al-Masad', englishNameTranslation: 'The Palm Fiber', numberOfAyahs: 5, revelationType: 'Meccan', startingJuz: 30 },
  { number: 112, name: 'الإخلاص', englishName: 'Al-Ikhlas', englishNameTranslation: 'The Sincerity', numberOfAyahs: 4, revelationType: 'Meccan', startingJuz: 30 },
  { number: 113, name: 'الفلق', englishName: 'Al-Falaq', englishNameTranslation: 'The Daybreak', numberOfAyahs: 5, revelationType: 'Meccan', startingJuz: 30 },
  { number: 114, name: 'الناس', englishName: 'An-Nas', englishNameTranslation: 'Mankind', numberOfAyahs: 6, revelationType: 'Meccan', startingJuz: 30 },
];

// Offline built-in cache for popular surahs so the app works even offline without network
export const OFFLINE_SURAHS: Record<number, AyahItem[]> = {
  1: [
    {
      numberInSurah: 1,
      globalNumber: 1,
      textUthmani: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
      translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
      juz: 1,
      tafsir: 'Al-Fatihah is the greatest chapter in the Quran. The Basmalah is an invocation of Allah’s name before initiating any righteous act.',
      words: [
        { arabic: 'بِسْمِ', translation: 'In (the) name', transliteration: 'bismi' },
        { arabic: 'ٱللَّهِ', translation: '(of) Allah', transliteration: 'llahi' },
        { arabic: 'ٱلرَّحْمَٰنِ', translation: 'the Entirely Merciful', transliteration: 'l-rahmani' },
        { arabic: 'ٱلرَّحِيمِ', translation: 'the Especially Merciful', transliteration: 'l-rahimi' }
      ]
    },
    {
      numberInSurah: 2,
      globalNumber: 2,
      textUthmani: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
      translation: '[All] praise is [due] to Allah, Lord of the worlds -',
      juz: 1,
      tafsir: 'Praise is sincere gratitude and acknowledgment of perfection belonging exclusively to Allah, the Cherisher of all creation.',
      words: [
        { arabic: 'ٱلْحَمْدُ', translation: 'All praise', transliteration: 'al-hamdu' },
        { arabic: 'لِلَّهِ', translation: '(is) for Allah', transliteration: 'lillahi' },
        { arabic: 'رَبِّ', translation: 'Lord', transliteration: 'rabbi' },
        { arabic: 'ٱلْعَٰلَمِينَ', translation: '(of) the worlds', transliteration: 'l-alamina' }
      ]
    },
    {
      numberInSurah: 3,
      globalNumber: 3,
      textUthmani: 'ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
      translation: 'The Entirely Merciful, the Especially Merciful,',
      juz: 1,
      tafsir: 'Ar-Rahman is expansive mercy covering all creation in this worldly life; Ar-Rahim is His special mercy reserved for the believers.',
      words: [
        { arabic: 'ٱلرَّحْمَٰنِ', translation: 'The Entirely Merciful', transliteration: 'al-rahmani' },
        { arabic: 'ٱلرَّحِيمِ', translation: 'the Especially Merciful', transliteration: 'l-rahimi' }
      ]
    },
    {
      numberInSurah: 4,
      globalNumber: 4,
      textUthmani: 'مَٰلِكِ يَوْمِ ٱلدِّينِ',
      translation: 'Sovereign of the Day of Recompense.',
      juz: 1,
      tafsir: 'Master and sole Ruler on the Day of Judgment when all worldly titles and false claims cease.',
      words: [
        { arabic: 'مَٰلِكِ', translation: 'Master', transliteration: 'maliki' },
        { arabic: 'يَوْمِ', translation: '(of the) Day', transliteration: 'yawmi' },
        { arabic: 'ٱلدِّينِ', translation: '(of) Judgment', transliteration: 'l-dini' }
      ]
    },
    {
      numberInSurah: 5,
      globalNumber: 5,
      textUthmani: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
      translation: 'It is You we worship and You we ask for help.',
      juz: 1,
      tafsir: 'The pinnacle of Tawheed (monotheism): dedicating pure worship exclusively to Allah and seeking assistance only from Him.',
      words: [
        { arabic: 'إِيَّاكَ', translation: 'You alone', transliteration: 'iyyaka' },
        { arabic: 'نَعْبُدُ', translation: 'we worship', transliteration: 'na\'budu' },
        { arabic: 'وَإِيَّاكَ', translation: 'and You alone', transliteration: 'wa-iyyaka' },
        { arabic: 'نَسْتَعِينُ', translation: 'we ask for help', transliteration: 'nasta\'inu' }
      ]
    },
    {
      numberInSurah: 6,
      globalNumber: 6,
      textUthmani: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ',
      translation: 'Guide us to the straight path -',
      juz: 1,
      tafsir: 'A heartfelt plea for steadfast guidance upon Islam, the true path illuminated by the Prophet and his companions.',
      words: [
        { arabic: 'ٱهْدِنَا', translation: 'Guide us', transliteration: 'ih\'dina' },
        { arabic: 'ٱلصِّرَٰطَ', translation: '(to) the path', transliteration: 'l-sirata' },
        { arabic: 'ٱلْمُسْتَقِيمَ', translation: 'the straight', transliteration: 'l-mustaqima' }
      ]
    },
    {
      numberInSurah: 7,
      globalNumber: 7,
      textUthmani: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ',
      translation: 'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.',
      juz: 1,
      tafsir: 'The path of the prophets, truthful, martyrs, and righteous; protected from knowing the truth and disobeying it or deviating in ignorance.',
      words: [
        { arabic: 'صِرَٰطَ', translation: '(The) path', transliteration: 'sirata' },
        { arabic: 'ٱلَّذِينَ', translation: '(of) those', transliteration: 'alladhina' },
        { arabic: 'أَنْعَمْتَ', translation: 'You have bestowed favor', transliteration: 'an\'amta' },
        { arabic: 'عَلَيْهِمْ', translation: 'upon them', transliteration: 'alayhim' },
        { arabic: 'غَيْرِ', translation: 'not (of)', transliteration: 'ghayri' },
        { arabic: 'ٱلْمَغْضُوبِ', translation: 'those who earned anger', transliteration: 'l-maghdubi' },
        { arabic: 'عَلَيْهِمْ', translation: 'upon them', transliteration: 'alayhim' },
        { arabic: 'وَلَا', translation: 'and not', transliteration: 'wala' },
        { arabic: 'ٱلضَّآلِّينَ', translation: '(of) those who go astray', transliteration: 'l-dallina' }
      ]
    }
  ],
  112: [
    {
      numberInSurah: 1,
      globalNumber: 6222,
      textUthmani: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ',
      translation: 'Say, "He is Allah, [who is] One,',
      juz: 30,
      tafsir: 'Affirming absolute singularity in essence, names, attributes, and worship.',
      words: [
        { arabic: 'قُلْ', translation: 'Say', transliteration: 'qul' },
        { arabic: 'هُوَ', translation: 'He is', transliteration: 'huwa' },
        { arabic: 'ٱللَّهُ', translation: 'Allah', transliteration: 'llahu' },
        { arabic: 'أَحَدٌ', translation: 'One', transliteration: 'ahadun' }
      ]
    },
    {
      numberInSurah: 2,
      globalNumber: 6223,
      textUthmani: 'ٱللَّهُ ٱلصَّمَدُ',
      translation: 'Allah, the Eternal Refuge.',
      juz: 30,
      tafsir: 'The Self-Sufficient Master upon whom all creatures depend in every need, while He needs none.',
      words: [
        { arabic: 'ٱللَّهُ', translation: 'Allah', transliteration: 'llahu' },
        { arabic: 'ٱلصَّمَدُ', translation: 'the Eternal Refuge', transliteration: 'l-samadu' }
      ]
    },
    {
      numberInSurah: 3,
      globalNumber: 6224,
      textUthmani: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
      translation: 'He neither begets nor is born,',
      juz: 30,
      tafsir: 'He has no offspring, no parent, and no equal.',
      words: [
        { arabic: 'لَمْ', translation: 'Not', transliteration: 'lam' },
        { arabic: 'يَلِدْ', translation: 'He begets', transliteration: 'yalid' },
        { arabic: 'وَلَمْ', translation: 'and not', transliteration: 'walam' },
        { arabic: 'يُولَدْ', translation: 'is He begotten', transliteration: 'yulad' }
      ]
    },
    {
      numberInSurah: 4,
      globalNumber: 6225,
      textUthmani: 'وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ',
      translation: 'Nor is there to Him any equivalent."',
      juz: 30,
      tafsir: 'Nothing resembles Him, and He is the Hearing, the Seeing.',
      words: [
        { arabic: 'وَلَمْ', translation: 'And not', transliteration: 'walam' },
        { arabic: 'يَكُن', translation: 'is', transliteration: 'yakun' },
        { arabic: 'لَّهُۥ', translation: 'for Him', transliteration: 'lahu' },
        { arabic: 'كُفُوًا', translation: 'equivalent', transliteration: 'kufuwan' },
        { arabic: 'أَحَدٌۢ', translation: 'anyone', transliteration: 'ahadun' }
      ]
    }
  ],
  113: [
    {
      numberInSurah: 1,
      globalNumber: 6226,
      textUthmani: 'قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ',
      translation: 'Say, "I seek refuge in the Lord of daybreak',
      juz: 30,
      words: [
        { arabic: 'قُلْ', translation: 'Say', transliteration: 'qul' },
        { arabic: 'أَعُوذُ', translation: 'I seek refuge', transliteration: 'a\'udhu' },
        { arabic: 'بِرَبِّ', translation: 'in (the) Lord', transliteration: 'birabbi' },
        { arabic: 'ٱلْفَلَقِ', translation: '(of) the daybreak', transliteration: 'l-falaqi' }
      ]
    },
    {
      numberInSurah: 2,
      globalNumber: 6227,
      textUthmani: 'مِن شَرِّ مَا خَلَقَ',
      translation: 'From the evil of that which He created',
      juz: 30,
      words: [
        { arabic: 'مِن', translation: 'From', transliteration: 'min' },
        { arabic: 'شَرِّ', translation: '(the) evil', transliteration: 'sharri' },
        { arabic: 'مَا', translation: '(of) what', transliteration: 'ma' },
        { arabic: 'خَلَقَ', translation: 'He created', transliteration: 'khalaqa' }
      ]
    },
    {
      numberInSurah: 3,
      globalNumber: 6228,
      textUthmani: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ',
      translation: 'And from the evil of darkness when it settles',
      juz: 30,
      words: [
        { arabic: 'وَمِن', translation: 'And from', transliteration: 'wamin' },
        { arabic: 'شَرِّ', translation: '(the) evil', transliteration: 'sharri' },
        { arabic: 'غَاسِقٍ', translation: '(of) darkness', transliteration: 'ghasiqin' },
        { arabic: 'إِذَا', translation: 'when', transliteration: 'idha' },
        { arabic: 'وَقَبَ', translation: 'it spreads', transliteration: 'waqaba' }
      ]
    },
    {
      numberInSurah: 4,
      globalNumber: 6229,
      textUthmani: 'وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ',
      translation: 'And from the evil of the blowers in knots',
      juz: 30,
      words: [
        { arabic: 'وَمِن', translation: 'And from', transliteration: 'wamin' },
        { arabic: 'شَرِّ', translation: '(the) evil', transliteration: 'sharri' },
        { arabic: 'ٱلنَّفَّٰثَٰتِ', translation: '(of) the blowers', transliteration: 'l-naffathati' },
        { arabic: 'فِى', translation: 'in', transliteration: 'fi' },
        { arabic: 'ٱلْعُقَدِ', translation: 'the knots', transliteration: 'l-uqadi' }
      ]
    },
    {
      numberInSurah: 5,
      globalNumber: 6230,
      textUthmani: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
      translation: 'And from the evil of an envier when he envies."',
      juz: 30,
      words: [
        { arabic: 'وَمِن', translation: 'And from', transliteration: 'wamin' },
        { arabic: 'شَرِّ', translation: '(the) evil', transliteration: 'sharri' },
        { arabic: 'حَاسِدٍ', translation: '(of) an envier', transliteration: 'hasidin' },
        { arabic: 'إِذَا', translation: 'when', transliteration: 'idha' },
        { arabic: 'حَسَدَ', translation: 'he envies', transliteration: 'hasada' }
      ]
    }
  ],
  114: [
    {
      numberInSurah: 1,
      globalNumber: 6231,
      textUthmani: 'قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ',
      translation: 'Say, "I seek refuge in the Lord of mankind,',
      juz: 30,
      words: [
        { arabic: 'قُلْ', translation: 'Say', transliteration: 'qul' },
        { arabic: 'أَعُوذُ', translation: 'I seek refuge', transliteration: 'a\'udhu' },
        { arabic: 'بِرَبِّ', translation: 'in (the) Lord', transliteration: 'birabbi' },
        { arabic: 'ٱلنَّاسِ', translation: '(of) mankind', transliteration: 'l-nasi' }
      ]
    },
    {
      numberInSurah: 2,
      globalNumber: 6232,
      textUthmani: 'مَلِكِ ٱلنَّاسِ',
      translation: 'The Sovereign of mankind.',
      juz: 30,
      words: [
        { arabic: 'مَلِكِ', translation: 'The King', transliteration: 'maliki' },
        { arabic: 'ٱلنَّاسِ', translation: '(of) mankind', transliteration: 'l-nasi' }
      ]
    },
    {
      numberInSurah: 3,
      globalNumber: 6233,
      textUthmani: 'إِلَٰهِ ٱلنَّاسِ',
      translation: 'The God of mankind,',
      juz: 30,
      words: [
        { arabic: 'إِلَٰهِ', translation: '(The) God', transliteration: 'ilahi' },
        { arabic: 'ٱلنَّاسِ', translation: '(of) mankind', transliteration: 'l-nasi' }
      ]
    },
    {
      numberInSurah: 4,
      globalNumber: 6234,
      textUthmani: 'مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ',
      translation: 'From the evil of the retreating whisperer -',
      juz: 30,
      words: [
        { arabic: 'مِن', translation: 'From', transliteration: 'min' },
        { arabic: 'شَرِّ', translation: '(the) evil', transliteration: 'sharri' },
        { arabic: 'ٱلْوَسْوَاسِ', translation: '(of) the whisperer', transliteration: 'l-waswasi' },
        { arabic: 'ٱلْخَنَّاسِ', translation: 'the one who withdraws', transliteration: 'l-khannasi' }
      ]
    },
    {
      numberInSurah: 5,
      globalNumber: 6235,
      textUthmani: 'ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ',
      translation: 'Who whispers [evil] into the breasts of mankind -',
      juz: 30,
      words: [
        { arabic: 'ٱلَّذِى', translation: 'The one who', transliteration: 'alladhi' },
        { arabic: 'يُوَسْوِسُ', translation: 'whispers', transliteration: 'yuwaswisu' },
        { arabic: 'فِى', translation: 'in', transliteration: 'fi' },
        { arabic: 'صُدُورِ', translation: '(the) breasts', transliteration: 'suduri' },
        { arabic: 'ٱلنَّاسِ', translation: '(of) mankind', transliteration: 'l-nasi' }
      ]
    },
    {
      numberInSurah: 6,
      globalNumber: 6236,
      textUthmani: 'مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ',
      translation: 'From among the jinn and mankind."',
      juz: 30,
      words: [
        { arabic: 'مِنَ', translation: 'From', transliteration: 'mina' },
        { arabic: 'ٱلْجِنَّةِ', translation: 'the jinn', transliteration: 'l-jinnati' },
        { arabic: 'وَٱلنَّاسِ', translation: 'and mankind', transliteration: 'wal-nasi' }
      ]
    }
  ]
};

// Fetch surah ayahs live from AlQuran Cloud or fallback to offline
export async function fetchSurahAyahs(surahNumber: number): Promise<AyahItem[]> {
  // If in offline cache
  if (OFFLINE_SURAHS[surahNumber]) {
    return OFFLINE_SURAHS[surahNumber];
  }

  try {
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.sahih`);
    if (!res.ok) throw new Error('Failed to fetch from Quran API');
    const data = await res.json();
    const uthmaniEdition = data.data?.[0]?.ayahs ?? [];
    const englishEdition = data.data?.[1]?.ayahs ?? [];

    const ayahs: AyahItem[] = uthmaniEdition.map((ayah: any, index: number) => {
      const eng = englishEdition[index];
      return {
        numberInSurah: ayah.numberInSurah,
        globalNumber: ayah.number,
        textUthmani: ayah.text,
        translation: eng?.text ?? '',
        juz: ayah.juz,
        page: ayah.page,
      };
    });

    return ayahs;
  } catch (err) {
    console.warn(`Could not fetch live surah ${surahNumber}, returning generated placeholder`, err);
    // Return graceful placeholder ayahs
    const meta = SURAHS_LIST.find(s => s.number === surahNumber);
    const count = meta?.numberOfAyahs || 7;
    return Array.from({ length: Math.min(count, 15) }, (_, i) => ({
      numberInSurah: i + 1,
      globalNumber: (surahNumber - 1) * 20 + i + 1,
      textUthmani: `سُورَةُ ${meta?.name ?? ''} - آيَة ${i + 1}`,
      translation: `Surah ${meta?.englishName} Verse ${i + 1}`,
      juz: meta?.startingJuz ?? 1,
    }));
  }
}

// Generate direct audio URL for an ayah or surah
export function getAyahAudioUrl(surahNumber: number, ayahNumber: number, reciterId: number = 7): string {
  // Pad with zeroes for standard format (e.g. 001001.mp3)
  const surahPad = String(surahNumber).padStart(3, '0');
  const ayahPad = String(ayahNumber).padStart(3, '0');
  
  if (reciterId === 1) {
    return `https://everyayah.com/data/Abdul_Basit_Mujawwad_128kbps/${surahPad}${ayahPad}.mp3`;
  } else if (reciterId === 2) {
    return `https://everyayah.com/data/Husary_128kbps/${surahPad}${ayahPad}.mp3`;
  } else if (reciterId === 3) {
    return `https://everyayah.com/data/Ghamadi_40kbps/${surahPad}${ayahPad}.mp3`;
  } else if (reciterId === 4) {
    return `https://everyayah.com/data/Abu_Bakr_Ash-Shaatree_128kbps/${surahPad}${ayahPad}.mp3`;
  }
  // Default: Mishari Rashid al-Afasy
  return `https://everyayah.com/data/Alafasy_128kbps/${surahPad}${ayahPad}.mp3`;
}
