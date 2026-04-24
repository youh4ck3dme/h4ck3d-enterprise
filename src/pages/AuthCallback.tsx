import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const errorDescription = url.searchParams.get('error_description');

        if (errorDescription) {
          throw new Error(decodeURIComponent(errorDescription));
        }

        if (!code) {
          throw new Error('Chýba autorizačný kód z OAuth providera.');
        }

        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
        if (sessionError) throw sessionError;

        navigate('/dashboard');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg || 'OAuth prihlásenie zlyhalo.');
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card rounded-3xl shadow-xl border border-border p-10 text-center">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="text-destructive" size={48} />
          <h1 className="text-xl font-medium text-foreground">Prihlásenie zlyhalo</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2.5 bg-primary text-primary-foreground rounded-full hover:bg-google-blue-hover transition-colors font-medium shadow-sm"
          >
            Späť na prihlásenie
          </button>
        </div>
      </div>
    </div>
  );
}

