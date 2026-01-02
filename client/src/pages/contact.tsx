import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NavigationHeader } from "@/components/navigation-header";
import { Mail, Phone, MapPin, Clock, MessageSquare, ShieldCheck, ExternalLink, Building2 } from "lucide-react";

const CONTACT_INFO = {
  department: "Tourism & Civil Aviation Department",
  address: "Block No. 28, SDA Complex, Kasumpti, Shimla, Himachal Pradesh 171009",
  phone: "0177-2625924",
  email: "tourismmin-hp@nic.in",
  hours: "Monday to Friday, 10 AM – 5 PM IST",
};

export default function Contact() {
  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationHeader
        title="HP Tourism Portal"
        subtitle="Homestay & B&B Registration"
        showBack={false}
        showHome
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/90 to-primary text-white">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
          <p className="text-white/80 max-w-2xl">
            Need help with your homestay registration, application status, or payments?
            We're here to assist you during business hours.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Contact Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 mb-10">
          {/* General Support Card */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">General Support</h2>
                  <p className="text-xs text-gray-500">For applicants & property owners</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-5">
                Questions about applications, inspections, document uploads, or payment issues?
                Our helpdesk team can assist you.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <a href={`mailto:${CONTACT_INFO.email}`} className="text-sm font-medium text-gray-900 hover:text-primary">
                      {CONTACT_INFO.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <a href={`tel:${CONTACT_INFO.phone}`} className="text-sm font-medium text-gray-900 hover:text-primary">
                      {CONTACT_INFO.phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <Clock className="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Working Hours</p>
                    <p className="text-sm font-medium text-gray-900">{CONTACT_INFO.hours}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Officer Access Card */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Officer & Admin Access</h2>
                  <p className="text-xs text-gray-500">For DA, DTDO & department staff</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-5">
                Need officer credentials, role updates, or password resets?
                Reach out to your division admin or the IT support team.
              </p>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 mb-4">
                <p className="text-sm text-amber-800">
                  <strong>Tip:</strong> If you're on the wrong login screen, use the toggle at the top
                  to switch between Officer and Applicant views.
                </p>
              </div>

              <Button variant="outline" className="w-full" asChild>
                <a href="mailto:tourismmin-hp@nic.in?subject=Officer%20Access%20Request">
                  <Mail className="h-4 w-4 mr-2" />
                  Request Access
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Office Location Section */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Map */}
            <div className="h-[300px] md:h-auto min-h-[300px] bg-gray-100">
              <iframe
                title="Tourism & Civil Aviation Department Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3435.710927145389!2d77.15533787509016!3d31.092098274378563!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3905786d3290d9e5%3A0x2aa95a012d56e0b4!2sDept.%20of%20Tourism%20and%20Civil%20Aviation%20HP!5e0!3m2!1sen!2sin!4v1708600000000!5m2!1sen!2sin"
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Address Info */}
            <div className="p-6 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Visit Our Office</h2>
                  <p className="text-xs text-gray-500">{CONTACT_INFO.department}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 leading-relaxed">{CONTACT_INFO.address}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-sm text-gray-700">{CONTACT_INFO.phone}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-sm text-gray-700">{CONTACT_INFO.email}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button asChild>
                  <a href={`mailto:${CONTACT_INFO.email}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a
                    href="https://maps.google.com/?q=Dept.+of+Tourism+and+Civil+Aviation+HP,+Shimla"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Get Directions
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer Note */}
        <p className="text-center text-xs text-gray-400 mt-8">
          Response times may vary during peak registration periods. For urgent matters, please call during office hours.
        </p>
      </div>
    </div>
  );
}
