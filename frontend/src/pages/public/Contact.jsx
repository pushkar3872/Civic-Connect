import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function Contact() {
  return (
    <div className="min-h-screen">
      <div className="navbar bg-primary text-primary-content px-6">
        <Link to="/" className="text-xl font-bold">CivicConnect</Link>
      </div>
      <div className="max-w-xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
        <div className="space-y-4">
          <div className="flex items-center gap-3"><Mail className="text-primary" /> support@civicconnect.in</div>
          <div className="flex items-center gap-3"><Phone className="text-primary" /> +91 1800-123-4567</div>
          <div className="flex items-center gap-3"><MapPin className="text-primary" /> Municipal Office, City Center</div>
        </div>
        <Link to="/" className="btn btn-primary mt-8">Back Home</Link>
      </div>
    </div>
  );
}
