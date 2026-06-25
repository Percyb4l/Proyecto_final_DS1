import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Play } from 'lucide-react';
import Navbar from '../components/Navbar';
import { salesApi } from '../services/api';
import type { PurchaseAccess } from '../types';
import { GENRE_LABELS, DIFFICULTY_LABELS } from '../types';

function VideoPlayer({ url, title }: { url: string; title: string }) {
  const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
  const isDirect = /\.(mp4|webm|ogg)(\?|$)/i.test(url);

  if (isYoutube) {
    const videoId = url.includes('youtu.be')
      ? url.split('/').pop()
      : new URL(url).searchParams.get('v');
    return (
      <iframe
        title={title}
        className="w-full aspect-video rounded-xl border border-[#333]"
        src={`https://www.youtube.com/embed/${videoId}`}
        allowFullScreen
      />
    );
  }

  if (isDirect) {
    return (
      <video controls className="w-full aspect-video rounded-xl border border-[#333] bg-black" src={url}>
        Tu navegador no soporta reproducción de video.
      </video>
    );
  }

  return (
    <div className="w-full aspect-video rounded-xl border border-[#333] bg-[#111] flex flex-col items-center justify-center gap-4 p-8 text-center">
      <Play className="w-16 h-16 text-[#FF6B1A]" />
      <p className="text-gray-300 font-semibold">{title}</p>
      <p className="text-sm text-gray-500">Contenido de demostración — en producción este enlace apuntará al video alojado.</p>
      {url && (
        <a href={url} target="_blank" rel="noreferrer" className="text-[#E91E8C] text-sm hover:underline break-all">
          {url}
        </a>
      )}
    </div>
  );
}

export default function PurchaseViewPage() {
  const { purchaseId } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState<PurchaseAccess | null>(null);
  const [activePart, setActivePart] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!purchaseId) return;
    salesApi.getPurchase(Number(purchaseId))
      .then((r) => {
        setPurchase(r.data);
        const nextPart = Math.min(
          r.data.choreography.video_count,
          Math.max(1, r.data.videos_watched + 1),
        );
        setActivePart(nextPart);
      })
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [purchaseId]);

  const handleSelectPart = async (partNumber: number) => {
    if (!purchase) return;
    setActivePart(partNumber);
    try {
      const res = await salesApi.markWatched(purchase.id, partNumber);
      setPurchase(res.data);
    } catch {
      /* mantener reproducción aunque falle el registro */
    }
  };

  if (loading || !purchase) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <Navbar />
        <p className="text-gray-500">Cargando coreografía...</p>
      </div>
    );
  }

  const videos = purchase.choreography.videos || [];
  const currentVideo = videos.find((v) => v.part_number === activePart) || videos[0];

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <Navbar />
      <div className="pt-24 px-6 pb-20 max-w-6xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#FF6B1A] mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Volver a mi dashboard
        </Link>

        <div className="mb-6">
          <span className="inline-block text-xs px-3 py-1 rounded-full bg-[#E91E8C] text-white mb-3">
            {GENRE_LABELS[purchase.choreography.genre]} · {DIFFICULTY_LABELS[purchase.choreography.difficulty]}
          </span>
          <h1 className="font-display text-4xl tracking-wide mb-2">{purchase.choreography.title}</h1>
          <p className="text-gray-400">Prof. {purchase.choreography.professor_name}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {currentVideo && (
              <VideoPlayer url={currentVideo.video_url} title={currentVideo.title} />
            )}
            <div className="card-light p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Progreso del paquete</span>
                <span className="text-[#FF6B1A]">{purchase.progress_percent}%</span>
              </div>
              <div className="h-2 bg-[#111] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FF6B1A] to-[#E91E8C]"
                  style={{ width: `${purchase.progress_percent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="card-light p-6 h-fit">
            <h2 className="font-display text-xl tracking-wide mb-4">VIDEOS DEL PAQUETE</h2>
            <div className="space-y-2">
              {videos.map((video) => {
                const watched = video.part_number <= purchase.videos_watched;
                const isActive = video.part_number === activePart;
                return (
                  <button
                    key={video.id}
                    type="button"
                    onClick={() => handleSelectPart(video.part_number)}
                    className={`w-full text-left p-4 rounded-xl border transition-colors ${
                      isActive
                        ? 'border-[#FF6B1A] bg-[#FF6B1A]/10'
                        : 'border-[#333] hover:border-[#FF6B1A]/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`mt-0.5 ${watched ? 'text-green-400' : 'text-gray-500'}`}>
                        {watched ? <CheckCircle className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </span>
                      <div>
                        <p className="text-xs text-[#FF6B1A] mb-1">Parte {video.part_number}</p>
                        <p className="text-sm font-medium">{video.title}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
