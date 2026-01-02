import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export default function PrintAffidavit() {
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

                <h1 className="text-lg font-bold text-center mb-2 uppercase decoration-double underline underline-offset-4">
                    Format of Affidavit U/S 29
                </h1>

                <p className="text-center font-semibold mb-12 text-sm">
                    Himachal Pradesh Tourism Development & Registration Act, 2002
                </p>

                <div className="space-y-6 text-justify">
                    <div className="leading-loose">
                        <div className="flex flex-wrap items-baseline gap-2">
                            I, <span className="flex-grow border-b border-black min-w-[200px]"></span>, <br className="print:hidden" />
                            S/o, D/o, W/o <span className="flex-grow border-b border-black min-w-[200px]"></span>, <br className="print:hidden" />
                            Age <span className="inline-block border-b border-black w-16 text-center"></span> years, <br className="print:hidden" />
                            R/o <span className="flex-grow border-b border-black min-w-[300px]"></span>
                        </div>
                        <p className="mt-4">
                            do hereby solemnly affirm and declare as under:-
                        </p>
                    </div>

                    <ol className="list-decimal pl-6 space-y-4">
                        <li>
                            That I have not been convicted of any offence under chapters XIV and XVI of the Indian Penal Code, 1860, or under any of the provisions of this Act, or of any offence punishable under any law providing for the prevention of hoarding, smuggling, or profiteering, or adulteration of food or drugs, or corruption.
                        </li>
                        <li>
                            That I have not been declared an insolvent by a court of competent jurisdiction.
                        </li>
                        <li>
                            That my name has not been removed from the register on the grounds mentioned in Section 29 of the Himachal Pradesh Tourism Development and Registration Act, 2002.
                        </li>
                    </ol>

                    <div className="pt-24 flex justify-end">
                        <div className="text-center w-56">
                            <div className="border-t border-black pt-2 font-bold">Deponent</div>
                        </div>
                    </div>

                    <div className="pt-8">
                        <h2 className="font-bold underline mb-4">VERIFICATION:</h2>
                        <p>
                            Verified that the contents of the above affidavit of mine are true and correct to the best of my knowledge and belief. Nothing has been concealed therein.
                        </p>
                    </div>

                    <div className="pt-8 mb-4">
                        <p className="leading-loose">
                            Signed and verified at <span className="inline-block border-b border-black w-48"></span>
                            on dated <span className="inline-block border-b border-black w-48"></span>.
                        </p>
                    </div>

                    <div className="pt-24 flex justify-end">
                        <div className="text-center w-56">
                            <div className="border-t border-black pt-2 font-bold">Deponent</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
