import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Result } from './ui/SharedUI';

export default function Dashboard({ session }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDoc, setActiveDoc] = useState(null); // The document the user clicks to view

  useEffect(() => {
    fetchDocuments();
  }, [session]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', session.user.id) // Only get THIS user's documents
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}>Loading your documents...</div>;

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      {/* Sidebar List of Documents */}
      <div style={{ width: '30%', background: 'var(--card)', borderRadius: 12, border: '1.5px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', background: 'var(--card-header)', borderBottom: '1.5px solid var(--border)', fontWeight: 700 }}>
          Saved Documents
        </div>
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {documents.length === 0 ? (
            <p style={{ padding: 16, fontSize: 13, color: 'var(--muted)' }}>No documents saved yet.</p>
          ) : (
            documents.map(doc => (
              <div 
                key={doc.id} 
                onClick={() => setActiveDoc(doc)}
                style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: activeDoc?.id === doc.id ? 'var(--accent-light)' : 'transparent', transition: 'all 0.1s' }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{doc.title}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {new Date(doc.created_at).toLocaleDateString()} · {doc.type.replace('_', ' ')}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main View Area */}
      <div style={{ width: '70%' }}>
        {activeDoc ? (
          <Result 
            content={activeDoc.content} 
            title={activeDoc.title}
            // We pass null to onRefine here so the refine chat bar doesn't show in the dashboard (for now)
            onRefine={null} 
          />
        ) : (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', background: 'var(--card)', borderRadius: 12, border: '1.5px solid var(--border)' }}>
            Select a document from the left to view it.
          </div>
        )}
      </div>
    </div>
  );
}