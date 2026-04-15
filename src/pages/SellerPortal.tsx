import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/supabase';

type ReturnItem = {
    id: string;
    customerName: string;
    orderId: string;
    itemName: string;
    reason: string;
    returnType: string;
    submittedAt: Date;
    fraudScore: number;
    status: string;
    inspectionStage: number;
    expiresAt: Date;
    imageUrl?: string;
    notes?: string;
};

const normalizeStatus = (status?: string) => status?.toLowerCase().trim() ?? 'pending';

const SellerPortal = () => {
    console.log('SellerPortal mounted');
    const [allReturns, setAllReturns] = useState<ReturnItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const itemsPerPage = 5;

    useEffect(() => {
        const fetchReturns = async () => {
            setLoading(true);
            setFetchError(null);

            console.log('Fetching returns from Supabase...');

            const { data, error } = await supabase
                .from('returns')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) {
                console.error('Supabase error:', error);
                setFetchError(error.message);
                setAllReturns([]);
                setLoading(false);
                return;
            }

            console.log('Fetched returns from Supabase:', data);

            const mapped: ReturnItem[] = (data ?? []).map((row: any) => ({
                id: String(row.id),
                customerName: row.customer_name ?? 'Unknown Customer',
                orderId: row.order_id ?? 'N/A',
                itemName: row.item_name ?? 'Unknown Item',
                reason: row.reason ?? '',
                returnType: row.return_type ?? 'standard',
                submittedAt: row.created_at ? new Date(row.created_at) : new Date(),
                fraudScore: typeof row.fraud_score === 'number' ? row.fraud_score : 0,
                status: normalizeStatus(row.status),
                inspectionStage: typeof row.inspection_stage === 'number' ? row.inspection_stage : 0,
                expiresAt: row.expires_at ? new Date(row.expires_at) : new Date(),
                imageUrl: row.image_url ?? undefined,
                notes: row.notes ?? undefined,
            }));

            setAllReturns(mapped);
            setLoading(false);
        };

        fetchReturns();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    const filteredReturns = useMemo(() => {
        const query = searchQuery.toLowerCase();

        return allReturns.filter((item) => {
            const matchesSearch =
                item.customerName.toLowerCase().includes(query) ||
                item.itemName.toLowerCase().includes(query) ||
                item.orderId.toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === 'all' || normalizeStatus(item.status) === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [allReturns, searchQuery, statusFilter]);

    const paginatedReturns = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredReturns.slice(start, start + itemsPerPage);
    }, [filteredReturns, currentPage]);

    const totalPages = Math.max(1, Math.ceil(filteredReturns.length / itemsPerPage));

    const approvedCount = allReturns.filter((r) => normalizeStatus(r.status) === 'approved').length;
    const flaggedCount = allReturns.filter((r) => normalizeStatus(r.status) === 'flagged').length;
    const rejectedCount = allReturns.filter((r) => normalizeStatus(r.status) === 'rejected').length;

    const getStatusColor = (status: string) => {
        switch (normalizeStatus(status)) {
            case 'approved':
                return '#dcfce7';
            case 'flagged':
                return '#fef3c7';
            case 'rejected':
                return '#fee2e2';
            default:
                return '#e5e7eb';
        }
    };

    const getTimeRemaining = (expiresAt: Date) => {
        const now = new Date().getTime();
        const end = expiresAt.getTime();
        const diff = end - now;

        if (diff <= 0) return 'Expired';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `${days}d ${hours % 24}h`;
        }

        return `${hours}h ${minutes}m`;
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>
                        Seller Portal
                    </h1>
                    <p style={{ color: '#64748b' }}>Manage live return inspections from Supabase</p>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Search returns..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            padding: '10px 12px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            minWidth: '260px',
                        }}
                    />

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                            padding: '10px 12px',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                        }}
                    >
                        <option value="all">All Status</option>
                        <option value="approved">Approved</option>
                        <option value="flagged">Flagged</option>
                        <option value="rejected">Rejected</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>

                {fetchError && (
                    <div
                        style={{
                            marginBottom: '20px',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            background: '#fef2f2',
                            color: '#991b1b',
                            border: '1px solid #fecaca',
                        }}
                    >
                        Error loading returns: {fetchError}
                    </div>
                )}

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                        gap: '16px',
                        marginBottom: '24px',
                    }}
                >
                    {[
                        { label: 'Total Returns', value: allReturns.length },
                        { label: 'Approved', value: approvedCount },
                        { label: 'Flagged', value: flaggedCount },
                        { label: 'Rejected', value: rejectedCount },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            style={{
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                padding: '16px',
                            }}
                        >
                            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>{stat.label}</p>
                            <p style={{ margin: '8px 0 0 0', fontSize: '28px', fontWeight: 700 }}>
                                {stat.value}
                            </p>
                        </div>
                    ))}
                </div>

                <div
                    style={{
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        overflow: 'hidden',
                    }}
                >
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    <th style={{ textAlign: 'left', padding: '14px' }}>Customer</th>
                                    <th style={{ textAlign: 'left', padding: '14px' }}>Product</th>
                                    <th style={{ textAlign: 'left', padding: '14px' }}>Fraud Score</th>
                                    <th style={{ textAlign: 'left', padding: '14px' }}>Status</th>
                                    <th style={{ textAlign: 'left', padding: '14px' }}>Time Left</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} style={{ padding: '24px', textAlign: 'center' }}>
                                            Loading returns...
                                        </td>
                                    </tr>
                                ) : paginatedReturns.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ padding: '24px', textAlign: 'center' }}>
                                            No returns found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedReturns.map((item) => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                            <td style={{ padding: '14px' }}>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{item.customerName}</div>
                                                    <div style={{ fontSize: '13px', color: '#64748b' }}>{item.orderId}</div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '14px' }}>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{item.itemName}</div>
                                                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                                                        {item.returnType}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '14px' }}>{item.fraudScore}</td>
                                            <td style={{ padding: '14px' }}>
                                                <span
                                                    style={{
                                                        padding: '6px 10px',
                                                        borderRadius: '999px',
                                                        background: getStatusColor(item.status),
                                                        fontSize: '13px',
                                                        fontWeight: 600,
                                                        textTransform: 'capitalize',
                                                    }}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px' }}>{getTimeRemaining(item.expiresAt)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '14px 16px',
                            background: '#f8fafc',
                        }}
                    >
                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                            {filteredReturns.length === 0
                                ? 'Showing 0 results'
                                : `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(
                                    currentPage * itemsPerPage,
                                    filteredReturns.length
                                )} of ${filteredReturns.length} results`}
                        </p>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                Prev
                            </button>
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || filteredReturns.length === 0}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerPortal;