'use client';

import { createInbox, deleteInbox } from '@/app/actions/inbox'; // Assuming path
import { useTransition, useState } from 'react';
import toast from 'react-hot-toast';

// Define minimal Inbox type if import fails, or assume generated types
// import { Inbox } from '@prisma/client'; 
// Using any for now to avoid build issues if types are not picked up immediately, but better to fetch them.

interface Inbox {
    id: number;
    userId: number;
    name: string | null;
    inboxId: string;
    createdAt: Date;
    updatedAt: Date;
}

export default function InboxList({ inboxes, mailDomain }: { inboxes: Inbox[], mailDomain: string }) {
    const [isPending, startTransition] = useTransition();
    // Assuming Free Tier limit is 3
    const isFull = inboxes.length >= 3;

    const [createName, setCreateName] = useState('');
    const [createId, setCreateId] = useState('');
    const [error, setError] = useState('');

    const handleCreate = async () => {
        if (!createName || !createId) {
            setError("Please fill all fields");
            return;
        }
        setError('');

        const formData = new FormData();
        formData.append("name", createName);
        formData.append("inboxId", createId);

        startTransition(async () => {
            // We need to properly import createInbox. I'll define it as import from actions
            // If createInbox returns { error: ... }
            // Wait, createInbox is a server action
            const result = await createInbox(formData);
            if (result?.error) {
                setError(result.error);
            } else {
                setCreateName('');
                setCreateId('');
                setError('');
            }
        });
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this inbox?")) return;
        startTransition(async () => {
            const result = await deleteInbox(id);
            if (result?.error) {
                setError(result.error);
            }
        });
    }

    return (
        <div className="space-y-6">
            {/* Create Form */}
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Inbox</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                        {error}
                    </div>
                )}

                {isFull ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-amber-600 mt-0.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                        <div>
                            <h3 className="text-sm font-medium text-amber-800">Plan Limit Reached</h3>
                            <p className="text-sm text-amber-700 mt-1">
                                You are on the Free Plan which includes 3 Inboxes.
                                <a href="#" className="font-medium underline ml-1 hover:text-amber-900">Upgrade to Pro</a> for unlimited inboxes.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Inbox Name</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                value={createName}
                                onChange={e => setCreateName(e.target.value)}
                                placeholder="e.g. Test Server 1"
                                disabled={isPending}
                            />
                        </div>
                        <div className="md:col-span-7">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Inbox ID</label>
                            <div className="flex items-center">
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-r-0 border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    value={createId}
                                    onChange={e => setCreateId(e.target.value)}
                                    placeholder="unique-id"
                                    disabled={isPending}
                                />
                                <span className="px-3 py-2 bg-gray-50 border border-l-0 border-gray-300 rounded-r-lg text-gray-500 text-sm font-medium select-none whitespace-nowrap">
                                    -{mailDomain}
                                </span>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <button
                                onClick={handleCreate}
                                disabled={isPending}
                                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors shadow-sm shadow-indigo-200"
                            >
                                {isPending ? 'Creating...' : 'Create Inbox'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-semibold text-gray-900">Your Inboxes</h3>
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                        {inboxes.length} / 3 Active
                    </span>
                </div>

                <div className="divide-y divide-gray-100">
                    {inboxes.map(inbox => (
                        <div key={inbox.id} className="p-6 hover:bg-gray-50 transition-colors group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold text-gray-900">{inbox.name}</h4>
                                        {/* Status dot or something */}
                                        <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active"></span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <code className="bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-600 font-mono">
                                            *@{inbox.inboxId}-{mailDomain}
                                        </code>
                                        <button
                                            className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors"
                                            title="Copy Address"
                                            onClick={() => {
                                                const address = `*@${inbox.inboxId}-${mailDomain}`;
                                                navigator.clipboard.writeText(address);
                                                toast.success('Address copied!');
                                            }}
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">
                                        Created on {new Date(inbox.createdAt).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {/* Settings button removed */}
                                    <button
                                        onClick={() => handleDelete(inbox.id)}
                                        disabled={isPending}
                                        className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {inboxes.length === 0 && (
                        <div className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                </svg>
                            </div>
                            <h3 className="text-base font-semibold text-gray-900">No inboxes found</h3>
                            <p className="mt-1 text-sm text-gray-500">Get started by creating your first inbox above.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
