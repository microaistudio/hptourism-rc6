import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export default function PrintUndertaking() {
    return (
        <div className="min-h-screen bg-neutral-100 p-8 print:p-0 print:bg-white">
            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 15mm;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                    }
                }
            `}</style>

            {/* Print Button - Hidden when printing */}
            <div className="max-w-[210mm] mx-auto mb-6 flex justify-end print:hidden">
                <Button onClick={() => window.print()}>
                    <Printer className="w-4 h-4 mr-2" />
                    Print Form
                </Button>
            </div>

            {/* A4 Page Container */}
            <div className="max-w-[210mm] mx-auto bg-white shadow-lg p-[25mm] print:shadow-none print:w-full print:max-w-none print:mx-0 print:p-0 text-black leading-relaxed text-sm font-serif">

                <h1 className="text-lg font-bold text-center mb-10 uppercase decoration-double underline underline-offset-4">
                    Undertaking (Form-C)
                </h1>

                <div className="space-y-6 text-justify pt-16">
                    <div className="leading-loose">
                        <div className="flex flex-wrap items-baseline gap-2">
                            I, <span className="flex-grow border-b border-black min-w-[200px]"></span>, <br className="print:hidden" />
                            S/o, D/o, W/o <span className="flex-grow border-b border-black min-w-[200px]"></span>, <br className="print:hidden" />
                            Age <span className="inline-block border-b border-black w-16 text-center"></span> years, <br className="print:hidden" />
                            R/o <span className="flex-grow border-b border-black min-w-[300px]"></span>.
                        </div>
                    </div>

                    <p>
                        I have read and understood all the terms and conditions mentioned in the <strong>Himachal Pradesh Home Stay Rules, 2025</strong> with respect to the approval and registration of the Home Stay Unit/Establishment and hereby agree to abide by them.
                    </p>

                    <p>
                        The information and documents provided are correct and authentic to the best of my knowledge.
                    </p>

                    <p>
                        I further declare that if there is any false statement or suppression of any material fact with the intention to mislead the prescribed authority at my end, I shall be liable for penal action as warranted by the <strong>Himachal Pradesh Tourism Development and Registration Act, 2002</strong> and the rules made thereunder.
                    </p>

                    <div className="pt-32 flex flex-col items-end">
                        <div className="border-b border-black w-64 mb-2"></div>
                        <div className="text-right w-80 font-bold text-sm">
                            (Signature and Name of the Owner in Block Letters)
                        </div>
                    </div>

                    <div className="pt-12 grid grid-cols-2 gap-8">
                        <div>
                            <p className="mb-4 leading-loose">
                                Place: <span className="inline-block border-b border-black w-40"></span>
                            </p>
                            <p className="leading-loose">
                                Date: <span className="inline-block border-b border-black w-40"></span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
