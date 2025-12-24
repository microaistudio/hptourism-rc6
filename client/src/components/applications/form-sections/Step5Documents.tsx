import { Dispatch, SetStateAction } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, AlertTriangle, Paperclip, Image } from "lucide-react";
import { ObjectUploader, type UploadedFileMetadata } from "@/components/ObjectUploader";
import { Progress } from "@/components/ui/progress";

interface UploadedDocuments {
    revenuePapers: UploadedFileMetadata[];
    affidavitSection29: UploadedFileMetadata[];
    undertakingFormC: UploadedFileMetadata[];
    commercialElectricityBill: UploadedFileMetadata[];
    commercialWaterBill: UploadedFileMetadata[];
}

interface Step5DocumentsProps {
    uploadedDocuments: UploadedDocuments;
    setUploadedDocuments: Dispatch<SetStateAction<UploadedDocuments>>;
    propertyPhotos: UploadedFileMetadata[];
    setPropertyPhotos: Dispatch<SetStateAction<UploadedFileMetadata[]>>;
    additionalDocuments: UploadedFileMetadata[];
    setAdditionalDocuments: Dispatch<SetStateAction<UploadedFileMetadata[]>>;
    requiresCommercialUtilityProof: boolean;
    isCorrection?: boolean;
    correctionNotes?: string;
    applicationKind?: string;
    isLegacyRC?: boolean;
}

export function Step5Documents({
    uploadedDocuments,
    setUploadedDocuments,
    propertyPhotos,
    setPropertyPhotos,
    additionalDocuments,
    setAdditionalDocuments,
    requiresCommercialUtilityProof,
    isCorrection = false,
    correctionNotes,
    applicationKind,
    isLegacyRC = false,
}: Step5DocumentsProps) {
    const isDeleteRooms = applicationKind === 'delete_rooms';

    // Calculate progress for required sections
    const requiredSections = isLegacyRC ? 1 : (requiresCommercialUtilityProof ? 6 : 4);
    let completedSections = 0;
    if (!isLegacyRC) {
        if (uploadedDocuments.revenuePapers.length > 0) completedSections++;
        if (uploadedDocuments.affidavitSection29.length > 0) completedSections++;
        if (uploadedDocuments.undertakingFormC.length > 0) completedSections++;
        if (propertyPhotos.length >= 2) completedSections++;
        if (requiresCommercialUtilityProof) {
            if (uploadedDocuments.commercialElectricityBill.length > 0) completedSections++;
            if (uploadedDocuments.commercialWaterBill.length > 0) completedSections++;
        }
    } else {
        if (additionalDocuments.length > 0) completedSections++;
    }
    const progressPercent = (completedSections / requiredSections) * 100;

    return (
        <div className="space-y-4">
            {/* Progress Card */}
            <Card className="shadow-sm">
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Document Upload Progress</span>
                        <span className="text-sm text-gray-500">{completedSections}/{requiredSections} required sections</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                </CardContent>
            </Card>

            {/* Main Form Card */}
            <Card className="shadow-lg border-0 overflow-hidden">
                <CardContent className="p-0">
                    {/* Correction Mode Banner */}
                    {isCorrection && (
                        <div className="m-6 mb-0 bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-amber-800">
                                        {isLegacyRC ? "Existing RC - Supporting Documents" : "Correction Mode"}
                                    </p>
                                    <p className="text-xs text-amber-700 mt-1">
                                        {isLegacyRC
                                            ? "Upload any supporting documents needed for your Existing RC application."
                                            : "Please update the documents that need correction and resubmit your application."
                                        }
                                    </p>
                                    {correctionNotes && (
                                        <div className="mt-2 p-3 bg-white rounded border border-amber-200">
                                            <p className="text-xs font-medium text-gray-700 mb-1">DA Feedback:</p>
                                            <p className="text-xs text-gray-600">{correctionNotes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section Header */}
                    <div className={`bg-gradient-to-r from-slate-800 to-slate-700 text-white px-6 py-4 ${isCorrection ? 'mt-6' : 'rounded-t-lg'}`}>
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

                    {/* For Legacy RC, show only supporting documents */}
                    {isLegacyRC ? (
                        <div className="p-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-blue-800">
                                    <strong>Existing RC Applications</strong> only require supporting documents. You do not need to upload Revenue Papers, Affidavits, or other new registration documents.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <Paperclip className="w-4 h-4 text-gray-500" />
                                    <label className="text-sm font-medium">Supporting Documents (Up to 5 files)</label>
                                </div>
                                <p className="text-xs text-gray-500 mb-2">
                                    Upload any supporting documents such as NOC, fire safety certificate, water quality report, or any other relevant documents.
                                </p>
                                <ObjectUploader
                                    label="Upload Supporting Documents"
                                    multiple={true}
                                    maxFiles={5}
                                    fileType="additional-document"
                                    category="documents"
                                    accept=".pdf,.jpg,.jpeg"
                                    onUploadComplete={(paths) => setAdditionalDocuments(paths)}
                                    existingFiles={additionalDocuments}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {/* Revenue Papers */}
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-medium text-gray-900">
                                            Revenue Papers (Jamabandi & Tatima) <span className="text-red-500">*</span>
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">Land revenue records showing ownership</p>
                                    </div>
                                    <span className="text-xs text-gray-400">{uploadedDocuments.revenuePapers.length}/2 files</span>
                                </div>
                                <ObjectUploader
                                    label="Upload Revenue Papers"
                                    maxFiles={2}
                                    fileType="revenue-papers"
                                    onUploadComplete={(paths) => setUploadedDocuments(prev => ({ ...prev, revenuePapers: paths }))}
                                    existingFiles={uploadedDocuments.revenuePapers}
                                    isMissing={!isDeleteRooms && uploadedDocuments.revenuePapers.length === 0}
                                />
                            </div>

                            {/* Affidavit */}
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-medium text-gray-900">
                                            Affidavit under Section 29 <span className="text-red-500">*</span>
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">Sworn statement as per homestay regulations</p>
                                    </div>
                                    <span className="text-xs text-gray-400">{uploadedDocuments.affidavitSection29.length}/1 files</span>
                                </div>
                                <ObjectUploader
                                    label="Upload Affidavit"
                                    maxFiles={1}
                                    fileType="affidavit-section29"
                                    onUploadComplete={(paths) => setUploadedDocuments(prev => ({ ...prev, affidavitSection29: paths }))}
                                    existingFiles={uploadedDocuments.affidavitSection29}
                                    isMissing={!isDeleteRooms && uploadedDocuments.affidavitSection29.length === 0}
                                />
                            </div>

                            {/* Undertaking Form-C */}
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-medium text-gray-900">
                                            Undertaking in Form-C <span className="text-red-500">*</span>
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">Signed undertaking form as per prescribed format</p>
                                    </div>
                                    <span className="text-xs text-gray-400">{uploadedDocuments.undertakingFormC.length}/1 files</span>
                                </div>
                                <ObjectUploader
                                    label="Upload Form-C"
                                    maxFiles={1}
                                    fileType="undertaking-form-c"
                                    onUploadComplete={(paths) => setUploadedDocuments(prev => ({ ...prev, undertakingFormC: paths }))}
                                    existingFiles={uploadedDocuments.undertakingFormC}
                                    isMissing={!isDeleteRooms && uploadedDocuments.undertakingFormC.length === 0}
                                />
                            </div>

                            {/* Commercial Utility Proofs (Conditional) */}
                            {requiresCommercialUtilityProof && (
                                <>
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="font-medium text-gray-900">
                                                    Proof of Commercial Electricity Bill <span className="text-red-500">*</span>
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1">Latest electricity bill showing commercial tariff</p>
                                            </div>
                                            <span className="text-xs text-gray-400">{uploadedDocuments.commercialElectricityBill.length}/1 files</span>
                                        </div>
                                        <ObjectUploader
                                            label="Upload Electricity Bill"
                                            maxFiles={1}
                                            fileType="commercial-electricity-bill"
                                            onUploadComplete={(paths) => setUploadedDocuments(prev => ({ ...prev, commercialElectricityBill: paths }))}
                                            existingFiles={uploadedDocuments.commercialElectricityBill}
                                            isMissing={!isDeleteRooms && uploadedDocuments.commercialElectricityBill.length === 0}
                                        />
                                    </div>

                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="font-medium text-gray-900">
                                                    Proof of Commercial Water Bill <span className="text-red-500">*</span>
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1">Commercial water connection bill for the homestay</p>
                                            </div>
                                            <span className="text-xs text-gray-400">{uploadedDocuments.commercialWaterBill.length}/1 files</span>
                                        </div>
                                        <ObjectUploader
                                            label="Upload Water Bill"
                                            maxFiles={1}
                                            fileType="commercial-water-bill"
                                            onUploadComplete={(paths) => setUploadedDocuments(prev => ({ ...prev, commercialWaterBill: paths }))}
                                            existingFiles={uploadedDocuments.commercialWaterBill}
                                            isMissing={!isDeleteRooms && uploadedDocuments.commercialWaterBill.length === 0}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Property Photographs */}
                            <div className="p-6 bg-gray-50/50">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Image className="w-5 h-5 text-blue-600" />
                                        <div>
                                            <h3 className="font-medium text-gray-900">
                                                Property Photographs <span className="text-red-500">*</span>
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">Clear photos of property exterior, rooms, and facilities (Min: 2)</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400">{propertyPhotos.length}/10 files</span>
                                </div>
                                <ObjectUploader
                                    label="Upload Property Photos"
                                    multiple={true}
                                    maxFiles={10}
                                    fileType="property-photo"
                                    category="photos"
                                    onUploadComplete={(paths) => setPropertyPhotos(paths)}
                                    existingFiles={propertyPhotos}
                                    isMissing={!isDeleteRooms && propertyPhotos.length < 2}
                                />
                            </div>

                            {/* Additional Documents */}
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Paperclip className="w-5 h-5 text-gray-500" />
                                        <div>
                                            <h3 className="font-medium text-gray-900">Additional/Supporting Documents</h3>
                                            <p className="text-sm text-gray-500 mt-1">NOC, fire safety certificate, water quality report, etc. (Optional)</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400">{additionalDocuments.length}/5 files</span>
                                </div>
                                <ObjectUploader
                                    label="Upload Supporting Documents"
                                    multiple={true}
                                    maxFiles={5}
                                    fileType="additional-document"
                                    category="documents"
                                    onUploadComplete={(paths) => setAdditionalDocuments(paths)}
                                    existingFiles={additionalDocuments}
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Validation Warning */}
            {!isLegacyRC && (() => {
                const missingRevenue = !isDeleteRooms && uploadedDocuments.revenuePapers.length === 0;
                const missingAffidavit = !isDeleteRooms && uploadedDocuments.affidavitSection29.length === 0;
                const missingUndertaking = !isDeleteRooms && uploadedDocuments.undertakingFormC.length === 0;
                const missingElectricity = !isDeleteRooms && requiresCommercialUtilityProof && uploadedDocuments.commercialElectricityBill.length === 0;
                const missingWater = !isDeleteRooms && requiresCommercialUtilityProof && uploadedDocuments.commercialWaterBill.length === 0;
                const missingPhotos = !isDeleteRooms && propertyPhotos.length < 2;
                const showWarning = missingRevenue || missingAffidavit || missingUndertaking || missingElectricity || missingWater || missingPhotos;

                if (!showWarning) return null;

                return (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-orange-800">Required documents missing:</p>
                                <ul className="text-xs text-orange-700 list-disc list-inside mt-1 space-y-0.5">
                                    {missingRevenue && <li>Revenue Papers (Jamabandi & Tatima)</li>}
                                    {missingAffidavit && <li>Affidavit under Section 29</li>}
                                    {missingUndertaking && <li>Undertaking in Form-C</li>}
                                    {missingElectricity && <li>Proof of commercial electricity bill</li>}
                                    {missingWater && <li>Proof of commercial water bill</li>}
                                    {missingPhotos && <li>At least 2 property photos ({propertyPhotos.length}/2)</li>}
                                </ul>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
