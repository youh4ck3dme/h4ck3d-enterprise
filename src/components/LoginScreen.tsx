import { useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type View = 'login' | 'signup' | 'forgot';

export default function LoginScreen() {
  const [view, setView] = useState<View>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [githubLoading, setGithubLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const switchView = (v: View) => {
    setView(v);
    setError('');
    setSuccessMsg('');
  };

  const getOAuthErrorMessage = (msg: string): string => {
    if (msg.includes('provider is not enabled')) {
      return 'Tento poskytovateľ prihlásenia nie je povolený. Skontrolujte nastavenia v Supabase dashboarde (Authentication → Providers). Ak problém pretrváva, použite prihlásenie cez email.';
    }
    if (msg.includes('popup_closed')) {
      return 'Prihlasovacie okno bolo zatvorené. Skúste to znova.';
    }
    return msg;
  };

  const handleGithubLogin = async () => {
    setGithubLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(getOAuthErrorMessage(msg) || 'GitHub prihlásenie zlyhalo.');
      setGithubLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(getOAuthErrorMessage(msg) || 'Google prihlásenie zlyhalo.');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (view === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSuccessMsg('Odkaz na obnovenie hesla bol odoslaný na váš email.');
      } else if (view === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        
        if (data.session) {
          // Ak je overenie vypnuté, Supabase nás okamžite prihlási
          return;
        }
        setSuccessMsg('Registrácia úspešná! Skontrolujte email pre overenie účtu.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Nastala chyba.');
    } finally {
      setLoading(false);
    }
  };

  const title = view === 'forgot' ? 'Obnovenie hesla' : view === 'signup' ? 'Vytvoriť účet' : 'Prihláste sa';
  const subtitle = view === 'forgot'
    ? 'Zadajte email a pošleme vám odkaz na obnovenie'
    : view === 'signup'
      ? 'Zaregistrujte sa do H4CK3D Enterprise'
      : 'Pokračujte do H4CK3D Enterprise';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-3xl shadow-xl border border-border p-10 text-center">
          <h1 className="text-2xl font-normal text-foreground mb-1">{title}</h1>
          <p className="text-muted-foreground text-sm mb-8">{subtitle}</p>

          {successMsg ? (
            <div className="py-6 text-success text-sm font-medium">{successMsg}</div>
          ) : (
            <>
              {/* GitHub OAuth Button */}
              {view !== 'forgot' && (
                <>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={googleLoading || loading}
                    className="w-full flex items-center justify-center gap-3 bg-white border-2 border-[#4285f4] text-[#4285f4] rounded-lg px-4 py-3.5 text-[15px] font-medium hover:bg-[#4285f4] hover:text-white transition-all disabled:opacity-50 shadow-sm"
                  >
                    {googleLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <svg height="20" viewBox="0 0 24 24" width="20" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23.99-3.71.99-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    )}
                    Pokračovať cez Google
                  </button>

                  <button
                    type="button"
                    onClick={handleGithubLogin}
                    disabled={githubLoading || loading}
                    className="w-full flex items-center justify-center gap-3 bg-[#24292e] text-white rounded-lg px-4 py-3.5 text-[15px] font-medium hover:bg-[#2f363d] transition-colors disabled:opacity-50"
                  >
                    {githubLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <svg height="20" viewBox="0 0 16 16" width="20" fill="currentColor">
                        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                      </svg>
                    )}
                    Pokračovať cez GitHub
                  </button>

                  <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">alebo cez email</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                </>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 ml-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full bg-card border border-border rounded-lg px-4 py-3.5 text-[15px] text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground disabled:opacity-50"
                    placeholder="vas@email.com"
                    required
                  />
                </div>

                {view !== 'forgot' && (
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5 ml-1">Heslo</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="w-full bg-card border border-border rounded-lg px-4 py-3.5 text-[15px] text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground disabled:opacity-50"
                      placeholder={view === 'signup' ? 'Minimálne 6 znakov' : 'Heslo'}
                      required
                      minLength={6}
                    />
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 text-destructive text-sm px-1">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4">
                  <div className="flex flex-col gap-1">
                    {view === 'login' && (
                      <>
                        <button type="button" onClick={() => switchView('signup')} className="text-sm text-primary hover:underline font-medium text-left">
                          Vytvoriť účet
                        </button>
                        <button type="button" onClick={() => switchView('forgot')} className="text-xs text-muted-foreground hover:text-primary hover:underline text-left">
                          Zabudli ste heslo?
                        </button>
                      </>
                    )}
                    {view === 'signup' && (
                      <button type="button" onClick={() => switchView('login')} className="text-sm text-primary hover:underline font-medium text-left">
                        Už mám účet
                      </button>
                    )}
                    {view === 'forgot' && (
                      <button type="button" onClick={() => switchView('login')} className="text-sm text-primary hover:underline font-medium text-left">
                        Späť na prihlásenie
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-2.5 bg-primary text-primary-foreground rounded-full hover:bg-google-blue-hover transition-colors font-medium disabled:opacity-50 shadow-sm"
                  >
                    {loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : view === 'forgot' ? (
                      'Odoslať'
                    ) : view === 'signup' ? (
                      'Registrovať'
                    ) : (
                      'Prihlásiť'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
