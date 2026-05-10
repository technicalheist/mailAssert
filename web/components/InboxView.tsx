'use client'

import { useState, useEffect, useRef } from 'react'
import { checkInboxAction, deleteEmailAction, markEmailReadAction } from '@/app/actions'
import toast from 'react-hot-toast'

type Email = {
    id: string
    from: string
    to: string
    subject: string
    date: Date
    body: string
    seq: number
    isRead?: boolean
}

export default function InboxView({
    initialEmails,
    inboxAddress: initialAddress,
    initialInboxes = [],
    currentInboxId,
    mailDomain
}: {
    initialEmails: Email[],
    inboxAddress: string,
    initialInboxes?: { id: string, name: string, domain: string }[],
    currentInboxId?: string,
    mailDomain?: string
}) {
    const [emails, setEmails] = useState<Email[]>(initialEmails)
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
    const [loading, setLoading] = useState(false)
    const [activeId, setActiveId] = useState(currentInboxId || (initialInboxes[0]?.id))
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(initialEmails.length >= 20)
    const [fetchingMore, setFetchingMore] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const isFirstRun = useRef(true);
    const [isFooterExpanded, setFooterExpanded] = useState(false)

    // Debounce search
    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        const timer = setTimeout(() => {
            refreshInbox(undefined, searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Derived address
    // If we have inboxes, we can construct it. Otherwise use initialAddress
    const activeInbox = initialInboxes.find(i => i.id === activeId);
    const domain = mailDomain || process.env.NEXT_PUBLIC_MAIL_DOMAIN || 'mailassert.com';
    // Format: <any>@<inboxId>-<domain>
    const currentAddressDisplay = activeInbox
        ? `*@${activeInbox.id}-${domain}`
        : initialAddress;

    const refreshInbox = async (idOverride?: string, searchOverride?: string) => {
        setLoading(true)
        const targetId = idOverride || activeId;
        const search = searchOverride !== undefined ? searchOverride : searchQuery;

        const res = await checkInboxAction(targetId, 0, search)
        if (res.success && res.emails) {
            setEmails(res.emails as any)
            setPage(0)
            setHasMore(res.emails.length >= 20)
            if (res.inboxId) setActiveId(res.inboxId);
        }
        setLoading(false)
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchQuery(val);
        // Debounce logic could go here or useEffect. 
        // For now, let's just trigger refresh on Enter? 
        // Or simple timeout
    }

    // Using useEffect for debounce - requires adding import { useEffect }
    // I'll skip import for now and assume useEffect is available or I add it.
    // Actually I need to add useEffect import.

    // Let's rely on Enter key for now? Or simple onBlur?
    // User requested "filter based on...", implies interactivity.
    // I will add useEffect in a separate step or assume I can modify imports.
    // I'll do imports in separate step. 

    // For now, I'll use onKeyDown for Enter to Search.
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            refreshInbox(undefined, searchQuery);
        }
    }

    const handleInboxChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newId = e.target.value;
        setActiveId(newId);
        setSelectedEmail(null);
        setSearchQuery(''); // clear search on inbox change
        refreshInbox(newId, '');
    }

    const handleDeleteEmail = async () => {
        if (!selectedEmail) return;
        if (!confirm("Delete this email?")) return;

        const res = await deleteEmailAction(selectedEmail.id);
        if (res.success) {
            toast.success("Email deleted");
            setEmails(prev => prev.filter(e => e.id !== selectedEmail.id));
            setSelectedEmail(null);
        } else {
            toast.error(res.error || "Failed to delete");
        }
    }

    const loadMoreMessages = async () => {
        if (fetchingMore || !hasMore) return;
        setFetchingMore(true);
        const nextPage = page + 1;
        const res = await checkInboxAction(activeId, nextPage, searchQuery);
        if (res.success && res.emails && res.emails.length > 0) {
            setEmails(prev => [...prev, ...res.emails as any]);
            setPage(nextPage);
            setHasMore(res.emails.length >= 20);
        } else {
            setHasMore(false);
        }
        setFetchingMore(false);
    }

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50) {
            if (!fetchingMore && hasMore) {
                loadMoreMessages();
            }
        }
    }

    const handleSelectEmail = (email: Email) => {
        setSelectedEmail(email);

        if (!email.isRead) {
            // Optimistic update
            setEmails(prev => prev.map(e => e.id === email.id ? { ...e, isRead: true } : e));
            setSelectedEmail({ ...email, isRead: true });

            // Server call in background
            markEmailReadAction(email.id);
        }
    }

    return (
        <div className="flex-1 flex overflow-hidden h-full">
            {/* Left Column: Inbox List */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 z-10">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 space-y-3">
                    {/* Search Input */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Filter from, to, subject..."
                            className="w-full pl-8 pr-4 py-2 text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={searchQuery}
                            onChange={handleSearch}
                            onKeyDown={handleKeyDown}
                        />
                        <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={() => refreshInbox()} disabled={loading} className="flex-1 py-2 rounded-lg text-sm font-medium text-white primary-gradient-bg shadow-md shadow-blue-500/20 hover:opacity-90 transition-opacity disabled:opacity-50">
                            {loading ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                </div>

                {/* List */}
                <div
                    className="flex-1 overflow-y-auto"
                    onScroll={handleScroll}
                >
                    {emails.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            <p>No emails yet</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {emails.map(email => (
                                <li key={email.id} onClick={() => handleSelectEmail(email)} className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedEmail?.id === email.id ? 'bg-blue-50' : (email.isRead ? 'bg-white' : 'bg-white')}`}>
                                    <div className={`mr-2 flex items-center justify-between`}>
                                        <div className={`truncate ${!email.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>{email.from}</div>
                                        {!email.isRead && <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0"></span>}
                                    </div>
                                    <div className={`text-sm truncate ${!email.isRead ? 'font-semibold text-gray-800' : 'font-normal text-gray-500'}`}>{email.subject}</div>
                                    <div className="text-xs text-gray-400 mt-1">{new Date(email.date).toLocaleString()}</div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div
                        className="flex items-center justify-between cursor-pointer select-none group"
                        onClick={() => setFooterExpanded(!isFooterExpanded)}
                    >
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold group-hover:text-indigo-600 transition-colors">Active Inbox</span>
                            <span className="text-sm font-medium text-gray-900 truncate" title={activeInbox?.name}>{activeInbox?.name || 'Default'} ({activeId})</span>
                        </div>
                        <button className="p-1 rounded-full hover:bg-gray-200 text-gray-400 group-hover:text-indigo-600 transition-colors">
                            <svg className={`w-5 h-5 transition-transform duration-200 ${isFooterExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>

                    {isFooterExpanded && (
                        <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            {/* Inbox Selector */}
                            {initialInboxes.length > 0 && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Switch Inbox</label>
                                    <select
                                        value={activeId}
                                        onChange={handleInboxChange}
                                        className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                                    >
                                        {initialInboxes.map(inbox => (
                                            <option key={inbox.id} value={inbox.id}>
                                                {inbox.name} ({inbox.id})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <div className="text-xs font-medium text-gray-500 mb-1">Inbox Address</div>
                                <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-2 gap-2 shadow-sm">
                                    <code className="text-xs font-mono text-gray-600 truncate flex-1">{currentAddressDisplay}</code>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigator.clipboard.writeText(currentAddressDisplay.replace('*@', 'test@'));
                                            toast.success('Address copied!');
                                        }}
                                        className="text-gray-400 hover:text-blue-500 p-1 rounded hover:bg-gray-50"
                                        title="Copy Example Address"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                                        </svg>
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1 pl-1">
                                    Prefix example: <span className="font-mono text-gray-600">test{currentAddressDisplay.replace('*', '')}</span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Detail View */}
            <div className="flex-1 flex flex-col min-w-0 bg-white">
                {selectedEmail ? (
                    <div className="flex-1 overflow-y-auto p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedEmail.subject}</h2>
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                            <div>
                                <span className="font-semibold text-gray-900">From:</span> {selectedEmail.from}
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-sm text-gray-500">
                                    {new Date(selectedEmail.date).toLocaleString()}
                                </div>
                                <button
                                    onClick={handleDeleteEmail}
                                    className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 transition-colors"
                                    title="Delete Email"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                            <div>
                                <span className="font-semibold text-gray-900">To:</span> {selectedEmail.to}
                            </div>
                        </div>
                        <div className="prose max-w-none text-gray-800 whitespace-pre-wrap">
                            {selectedEmail.body}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <p>Select an email to view details</p>
                    </div>
                )}
            </div>
        </div>
    )
}
