import {
    FileText, FileImage, File, FileSpreadsheet, FileCode,
    FileVideo, FileAudio, Archive, FileJson
} from "lucide-react"

export const getDocumentIcon = (fileType) => {
    const type = fileType?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'img'].includes(type)) return FileImage;
    if (['doc', 'docx', 'rtf', 'txt'].includes(type)) return FileText;
    if (['pdf'].includes(type)) return FileText;
    if (['xls', 'xlsx', 'csv'].includes(type)) return FileSpreadsheet;
    if (['ppt', 'pptx'].includes(type)) return FileSpreadsheet;
    if (['html', 'css', 'js', 'jsx', 'ts', 'tsx'].includes(type)) return FileCode;
    if (['json'].includes(type)) return FileJson;
    if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(type)) return FileVideo;
    if (['mp3', 'wav', 'ogg', 'flac'].includes(type)) return FileAudio;
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(type)) return Archive;
    return File;
};

export const getDocumentStyles = (fileType) => {
    const type = fileType?.toLowerCase() || '';
    if (['pdf'].includes(type)) return { icon: 'text-red-500', bg: 'bg-red-50' };
    if (['doc', 'docx', 'rtf', 'txt'].includes(type)) return { icon: 'text-blue-500', bg: 'bg-blue-50' };
    if (['xls', 'xlsx', 'csv'].includes(type)) return { icon: 'text-green-500', bg: 'bg-green-50' };
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'img'].includes(type)) return { icon: 'text-purple-500', bg: 'bg-purple-50' };
    if (['ppt', 'pptx'].includes(type)) return { icon: 'text-orange-500', bg: 'bg-orange-50' };
    if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(type)) return { icon: 'text-pink-500', bg: 'bg-pink-50' };
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(type)) return { icon: 'text-yellow-500', bg: 'bg-yellow-50' };
    if (['html', 'css', 'js', 'jsx', 'ts', 'tsx'].includes(type)) return { icon: 'text-indigo-500', bg: 'bg-indigo-50' };
    if (['json'].includes(type)) return { icon: 'text-teal-500', bg: 'bg-teal-50' };
    return { icon: 'text-gray-500', bg: 'bg-gray-50' };
};

export const formatFileSize = (bytes) => {
    if (typeof bytes === 'string' && (bytes.includes('Bytes') || bytes.includes('KB') || bytes.includes('MB') || bytes.includes('GB'))) {
        return bytes;
    }
    if (bytes === null || bytes === undefined || isNaN(bytes) || bytes < 0) {
        return "Unknown size";
    }
    if (bytes === 0) return "0 Bytes";
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}; 