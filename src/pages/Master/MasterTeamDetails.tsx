import React, { useEffect, useState } from 'react';
import { UsersRound, Loader2, ArrowLeft, Shield, Check, Hash, Lightbulb, Bookmark } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMasterAuth } from '../../context/MasterContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { problems } from '../../data/problems';

interface Member {
  _id: string;
  fullName: string;
  email: string;
  role: string;
}

interface Idea {
  _id: string;
  problemStatementId: number;
  status: string;
  createdBy: string;
  bookmarkedBy: string[];
  resourcesCount: number;
  notesCount: number;
}

interface TeamDetails {
  teamInfo: {
    _id: string;
    name: string;
    code: string;
    createdAt: string;
  };
  hierarchy: {
    leader: Member | null;
    coLeader: Member | null;
    members: Member[];
  };
  ideas: Idea[];
}

export default function MasterTeamDetails() {
  const { id } = useParams();
  const [data, setData] = useState<TeamDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState<any | null>(null);
  const { masterToken, logoutMaster } = useMasterAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeamDetails();
  }, [id]);

  const fetchTeamDetails = async () => {
    try {
      const res = await api.get(`/master/analytics/teams/${id}`, {
        headers: { Authorization: `Bearer ${masterToken}` }
      });
      setData(res.data);
    } catch (err: any) {
      toast.error('Failed to load team details');
      if (err.response?.status === 401) {
        logoutMaster();
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-emerald-500" /></div>;
  if (!data) return <div className="text-center py-20 text-slate-500">Team not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800">
        <button onClick={() => navigate('/master/teams')} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">Team: {data.teamInfo.name}</h1>
          <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-mono text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-300">
              <Hash size={12} /> {data.teamInfo.code}
            </span>
            • Created {data.teamInfo.createdAt ? format(new Date(data.teamInfo.createdAt), 'MMMM d, yyyy') : '-'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members Hierarchy */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6">
            <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
              <UsersRound size={16} className="text-emerald-500" /> Member Hierarchy
            </h2>
            
            <div className="space-y-4">
              {/* Leader */}
              {data.hierarchy.leader && (
                <div className="flex items-start gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                    <Shield size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{data.hierarchy.leader.fullName}</p>
                    <p className="text-xs text-slate-400">{data.hierarchy.leader.email}</p>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 mt-1 inline-block">Leader</span>
                  </div>
                </div>
              )}

              {/* Co-Leader */}
              {data.hierarchy.coLeader && (
                <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                    <Check size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{data.hierarchy.coLeader.fullName}</p>
                    <p className="text-xs text-slate-400">{data.hierarchy.coLeader.email}</p>
                    <span className="text-[10px] uppercase font-bold text-blue-400 mt-1 inline-block">Co-Leader</span>
                  </div>
                </div>
              )}

              {/* Members */}
              {data.hierarchy.members.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Members</p>
                  <div className="space-y-2">
                    {data.hierarchy.members.map(member => (
                      <div key={member._id} className="flex items-start gap-3 p-3 bg-slate-900 border border-slate-700/50 rounded-xl">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {member.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{member.fullName}</p>
                          <p className="text-xs text-slate-400">{member.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ideas & Bookmarks */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6">
            <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
              <Lightbulb size={16} className="text-amber-500" /> Researched Ideas & Bookmarks
            </h2>
            
            {data.ideas.length === 0 ? (
              <div className="text-center py-10 bg-slate-900/50 rounded-2xl border border-dashed border-slate-700">
                <p className="text-slate-500 text-sm">No ideas or bookmarks found for this team.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.ideas.map((idea) => {
                  const probDetails = problems.find(p => p.id === idea.problemStatementId);
                  
                  return (
                    <div 
                      key={idea._id} 
                      onClick={() => setSelectedProblem(probDetails)}
                      className="p-4 bg-slate-900 border border-slate-700 rounded-2xl hover:border-emerald-500/50 transition-colors cursor-pointer group"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                            {probDetails ? probDetails.title : `Problem PS${idea.problemStatementId}`}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1">ID: PS{idea.problemStatementId} • Created by {idea.createdBy}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          idea.status === 'Final Selected' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          idea.status === 'Shortlisted' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {idea.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 pt-3 border-t border-slate-800">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Bookmark size={14} className="text-purple-400" /> 
                          <span className="font-medium text-slate-300">{idea.bookmarkedBy.length}</span> Bookmarks
                        </div>
                      </div>
                      
                      {idea.bookmarkedBy.length > 0 && (
                        <div className="mt-3 bg-slate-950 rounded-xl p-3 border border-slate-800/50">
                          <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">Bookmarked By</p>
                          <div className="flex flex-wrap gap-2">
                            {idea.bookmarkedBy.map((name, i) => (
                              <span key={i} className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 text-xs">{name}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Problem Details Modal */}
      {selectedProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelectedProblem(null)}>
          <div 
            className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-sm font-mono font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">#{selectedProblem.id}</span>
                <h2 className="text-xl font-bold text-white mt-3">{selectedProblem.title}</h2>
              </div>
            </div>
            
            <div className="space-y-4 text-slate-300 text-sm">
              <p className="leading-relaxed whitespace-pre-wrap">{selectedProblem.description}</p>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Organization</p>
                  <p className="font-medium">{selectedProblem.organization}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Department</p>
                  <p className="font-medium">{selectedProblem.department}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Category</p>
                  <p className="font-medium">{selectedProblem.category}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Theme</p>
                  <p className="font-medium">{selectedProblem.theme}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800 flex justify-end">
              <button 
                onClick={() => setSelectedProblem(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-medium text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
