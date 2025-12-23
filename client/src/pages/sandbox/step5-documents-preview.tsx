import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    FileText, Upload, Check, X, AlertTriangle, Image, Paperclip,
    File, Trash2, Eye, Download
} from "lucide-react";

interface UploadedFile {
    id: string;
    name: string;
    size: string;
    status: "uploaded" | "pending" | "error";
}

interface DocumentSection {
    id: string;
    title: string;
    description: string;
    required: boolean;
    maxFiles: number;
    files: UploadedFile[];
    accept: string;
}

export default function Step5DocumentsPreview() {
    const [documents, setDocuments] = useState<DocumentSection[]>([
        {
            id: "revenuePapers",
            title: "Revenue Papers (Jamabandi & Tatima)",
            description: "Land revenue records showing ownership",
            required: true,
            maxFiles: 2,
            files: [],
            accept: ".pdf,.jpg,.jpeg"
        },
        {
            id: "affidavit",
            title: "Affidavit under Section 29",
            description: "Sworn statement as per homestay regulations",
            required: true,
            maxFiles: 1,
            files: [],
            accept: ".pdf"
        },
        {
            id: "undertaking",
            title: "Undertaking in Form-C",
            description: "Signed undertaking form as per prescribed format",
            required: true,
            maxFiles: 1,
            files: [],
            accept: ".pdf"
        },
        {
            id: "photos",
            title: "Property Photographs",
            description: "Clear photos of property exterior, rooms, and facilities",
            required: true,
            maxFiles: 10,
            files: [
                { id: "1", name: "exterior_view.jpg", size: "2.4 MB", status: "uploaded" },
                { id: "2", name: "room1_interior.jpg", size: "1.8 MB", status: "uploaded" },
            ],
            accept: ".jpg,.jpeg,.png"
        },
        {
            id: "additional",
            title: "Additional/Supporting Documents",
            description: "NOC, fire safety certificate, water quality report, etc.",
            required: false,
            maxFiles: 5,
            files: [],
            accept: ".pdf,.jpg,.jpeg"
        }
    ]);

    const simulateUpload = (sectionId: string) => {
        const randomFile: UploadedFile = {
            id: Date.now().toString(),
            name: `document_${Math.random().toString(36).substring(7)}.pdf`,
            size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`,
            status: "uploaded"
        };

        setDocuments(prev => prev.map(section => {
            if (section.id === sectionId && section.files.length < section.maxFiles) {
                return { ...section, files: [...section.files, randomFile] };
            }
            return section;
        }));
    };

    const removeFile = (sectionId: string, fileId: string) => {
        setDocuments(prev => prev.map(section => {
            if (section.id === sectionId) {
                return { ...section, files: section.files.filter(f => f.id !== fileId) };
            }
            return section;
        }));
    };

    const requiredDocs = documents.filter(d => d.required);
    const completedRequired = requiredDocs.filter(d => d.files.length > 0).length;
    const progressPercent = (completedRequired / requiredDocs.length) * 100;

    const photoSection = documents.find(d => d.id === "photos");
    const hasMinPhotos = photoSection && photoSection.files.length >= 2;

    const allRequiredComplete = requiredDocs.every(d => d.files.length > 0) && hasMinPhotos;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-slate-800">Step 5: Upload Documents</h1>
                    <p className="text-slate-500">Sandbox Preview - Upload required documents as per 2025 Homestay Rules (ANNEXURE-II)</p>
                </div>

                {/* Progress Card */}
                <Card className="shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Document Upload Progress</span>
                            <span className="text-sm text-gray-500">{completedRequired}/{requiredDocs.length} required sections</span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                    </CardContent>
                </Card>

                {/* Main Form Card */}
                <Card className="shadow-lg border-0">
                    <CardContent className="p-0">
                        {/* Section Header */}
                        <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-6 py-4 rounded-t-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div>
                                    <h2 className="font-semibold">Required Documents</h2>
                                    <p className="text-sm text-white/70">Upload all mandatory documents to proceed</p>
                                </div>
                            </div>
                        </div>

                        <div className="divide-y">
                            {documents.map((section, index) => {
                                const isMissing = section.required && section.files.length === 0;
                                const isPhotoSection = section.id === "photos";
                                const needsMorePhotos = isPhotoSection && section.files.length < 2;

                                return (
                                    <div key={section.id} className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium text-gray-900">
                                                        {section.title}
                                                        {section.required && <span className="text-red-500 ml-1">*</span>}
                                                    </h3>
                                                    {section.files.length > 0 && !needsMorePhotos && (
                                                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                                                            <Check className="w-3 h-3 mr-1" />
                                                            Uploaded
                                                        </Badge>
                                                    )}
                                                    {(isMissing || needsMorePhotos) && (
                                                        <Badge variant="destructive" className="bg-amber-100 text-amber-700 border-amber-200">
                                                            {needsMorePhotos ? `${section.files.length}/2 minimum` : "Missing"}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {section.files.length}/{section.maxFiles} files
                                            </span>
                                        </div>

                                        {/* Uploaded Files List */}
                                        {section.files.length > 0 && (
                                            <div className="space-y-2 mb-4">
                                                {section.files.map(file => (
                                                    <div
                                                        key={file.id}
                                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {isPhotoSection ? (
                                                                <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center">
                                                                    <Image className="w-5 h-5 text-blue-600" />
                                                                </div>
                                                            ) : (
                                                                <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center">
                                                                    <File className="w-5 h-5 text-slate-600" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-800">{file.name}</p>
                                                                <p className="text-xs text-gray-500">{file.size}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                                onClick={() => removeFile(section.id, file.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Upload Button */}
                                        {section.files.length < section.maxFiles && (
                                            <button
                                                onClick={() => simulateUpload(section.id)}
                                                className={`w-full border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-colors ${isMissing || needsMorePhotos
                                                        ? "border-amber-300 bg-amber-50 hover:bg-amber-100"
                                                        : "border-gray-200 hover:border-primary hover:bg-primary/5"
                                                    }`}
                                            >
                                                <Upload className={`w-6 h-6 ${isMissing || needsMorePhotos ? "text-amber-500" : "text-gray-400"}`} />
                                                <span className="text-sm font-medium text-gray-600">
                                                    Click to upload or drag and drop
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {isPhotoSection ? "JPG, JPEG, PNG" : "PDF, JPG, JPEG"} up to 5MB each
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Validation Warning */}
                {!allRequiredComplete && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-orange-800">Required documents missing:</p>
                                <ul className="text-xs text-orange-700 list-disc list-inside mt-1 space-y-0.5">
                                    {documents.filter(d => d.required && d.files.length === 0).map(d => (
                                        <li key={d.id}>{d.title}</li>
                                    ))}
                                    {photoSection && photoSection.files.length < 2 && (
                                        <li>At least 2 property photos ({photoSection.files.length}/2)</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Summary Bar */}
                <Card className="shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-slate-600" />
                                    <span className="text-sm font-medium">Documents</span>
                                </div>
                                <Badge variant="outline">
                                    {documents.reduce((sum, d) => sum + d.files.length, 0)} files uploaded
                                </Badge>
                                {allRequiredComplete && (
                                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                                        <Check className="w-3 h-3 mr-1" />
                                        All Required Complete
                                    </Badge>
                                )}
                            </div>
                            <Button disabled={!allRequiredComplete}>
                                Submit Application
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
