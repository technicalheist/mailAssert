'use client';

import { submitContactForm } from '@/app/actions/contact';
import { useActionState } from 'react';
import { useState } from 'react';

export default function ContactForm() {
    const [state, formAction, isPending] = useActionState(submitContactForm, undefined);
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        await formAction(data);
        if (state?.success) {
            setFormData({ name: '', email: '', message: '' });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Name
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="John Doe"
                />
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="john@example.com"
                />
            </div>

            <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Message
                </label>
                <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Tell us about your project..."
                />
            </div>

            {state?.error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
                    {state.error}
                </div>
            )}

            {state?.success && (
                <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-xl text-green-400 text-sm">
                    {state.success}
                </div>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? 'Sending...' : 'Send Message'}
            </button>
        </form>
    );
}
