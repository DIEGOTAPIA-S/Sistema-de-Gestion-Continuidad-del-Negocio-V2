import { useState, useEffect } from 'react';
import api from '../services/api';

const TwoFactorSetup = ({ onComplete }) => {
    const [qrCode, setQrCode] = useState(null);
    const [secret, setSecret] = useState('');
    const [token, setToken] = useState('');
    const [error, setError] = useState('');
    const [step, setStep] = useState('initial'); // initial, loading, qr, success
    const [status, setStatus] = useState({ has_2fa: false });

    useEffect(() => {
        checkStatus();
    }, []);

    const checkStatus = async () => {
        try {
            const res = await api.get('/2fa/status/');
            setStatus(res.data);
        } catch (e) {
            console.error("Error checking 2FA status", e);
        }
    };

    const startSetup = async () => {
        setStep('loading');
        try {
            const res = await api.post('/2fa/setup/');
            setQrCode(res.data.qr_code);
            setSecret(res.data.secret);
            setStep('qr');
        } catch (e) {
            setError("No se pudo iniciar la configuración. Intente de nuevo.");
            setStep('initial');
        }
    };

    const confirmSetup = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/2fa/confirm/', { token });
            setStep('success');
            checkStatus();
            if (onComplete) onComplete();
        } catch (e) {
            setError("Código incorrecto. Verifique su aplicación.");
        }
    };

    if (status.has_2fa && step === 'initial') {
        return (
            <div className="p-6 bg-green-50 border border-green-100 rounded-xl">
                <div className="flex items-center gap-3 text-green-800 font-bold mb-2">
                    <span className="text-xl">🛡️</span>
                    Protección Activa
                </div>
                <p className="text-sm text-green-700">
                    Su cuenta ya cuenta con verificación de dos pasos activa (TOTP). Microsoft Authenticator está vinculado correctamente.
                </p>
                <button
                    onClick={startSetup}
                    className="mt-4 text-xs font-semibold text-green-800 bg-green-100 px-3 py-1.5 rounded hover:bg-green-200 transition-colors"
                >
                    Reconfigurar Dispositivo
                </button>
            </div>
        );
    }

    if (step === 'loading') {
        return <div className="p-10 text-center animate-pulse text-slate-400">Generando llaves de seguridad...</div>;
    }

    if (step === 'qr') {
        return (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="text-blue-600">🛡️</span> Configurar Microsoft Authenticator
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="flex flex-col items-center">
                        <div className="bg-white p-3 border-2 border-slate-100 rounded-lg shadow-inner mb-3">
                            <img src={qrCode} alt="Código QR 2FA" className="w-48 h-48" />
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono break-all max-w-[200px] text-center">
                            Secret: {secret}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <ol className="text-sm text-slate-600 space-y-3 list-decimal list-inside">
                            <li>Abra <strong>Microsoft Authenticator</strong> en su celular.</li>
                            <li>Toque el icono <span className="text-blue-600 font-bold">+</span> y elija "Cuenta profesional o educativa" o "Otra cuenta".</li>
                            <li>Escanee el código QR que se muestra a la izquierda.</li>
                            <li>Ingrese el código de 6 dígitos que aparece en su celular abajo:</li>
                        </ol>

                        <form onSubmit={confirmSetup} className="space-y-3">
                            <input
                                type="text"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="000000"
                                maxLength={6}
                                required
                                className="w-full text-center text-2xl font-bold py-3 border-2 border-blue-100 rounded-xl focus:border-blue-500 outline-none bg-slate-50"
                            />
                            {error && <p className="text-xs text-red-600 font-medium text-center">⚠️ {error}</p>}
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                            >
                                ACTIVAR SEGURIDAD
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'success') {
        return (
            <div className="p-8 text-center bg-white rounded-xl border border-green-200 shadow-sm">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                    ✅
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">¡Seguridad Activada!</h3>
                <p className="text-slate-500 text-sm mb-6">
                    A partir de ahora, se le solicitará un código de Microsoft Authenticator cada vez que inicie sesión.
                </p>
                <button
                    onClick={() => setStep('initial')}
                    className="bg-slate-800 text-white px-6 py-2 rounded-lg hover:bg-slate-900 transition-colors"
                >
                    Entendido
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
            <h3 className="font-bold text-slate-800 mb-2">Seguridad de Acceso</h3>
            <p className="text-sm text-slate-500 mb-4">
                Añade una capa extra de protección a tu cuenta vinculándola con una aplicación de autenticación.
            </p>
            <button
                onClick={startSetup}
                className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
                <span>➕</span> Activar Segundo Factor (2FA)
            </button>
        </div>
    );
};

export default TwoFactorSetup;
