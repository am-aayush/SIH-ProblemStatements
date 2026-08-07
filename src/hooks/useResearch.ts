import { useState, useEffect, useCallback, useMemo } from 'react';
import { researchApi } from '../services/researchApi';
import { ResearchData, ProblemResearch, Comment, Vote, PipelineStage } from '../types/research';
import { useAuth } from '../context/AuthContext';

export function useResearch() {
  const { user } = useAuth();
  const [data, setData] = useState<ResearchData>({ research: [], votes: [], comments: [] });
  const [loading, setLoading] = useState(false);

  const fetchResearch = useCallback(async () => {
    if (!user?.teamId) return;
    setLoading(true);
    try {
      const res = await researchApi.getTeamResearch();
      setData(res);
    } catch (error) {
      console.error('Failed to fetch research data', error);
    } finally {
      setLoading(false);
    }
  }, [user?.teamId]);

  useEffect(() => {
    fetchResearch();
  }, [fetchResearch]);

  const getProblemResearch = useCallback((problemId: number) => {
    return data.research.find(r => r.problemStatementId === problemId);
  }, [data.research]);

  const getProblemComments = useCallback((problemId: number) => {
    return data.comments.filter(c => c.problemStatementId === problemId);
  }, [data.comments]);

  const getProblemVotes = useCallback((problemId: number) => {
    return data.votes.filter(v => v.problemStatementId === problemId);
  }, [data.votes]);

  const getAverageRating = useCallback((problemId: number) => {
    const votes = getProblemVotes(problemId);
    if (votes.length === 0) return 0;
    const sum = votes.reduce((acc, v) => acc + v.vote, 0);
    return Number((sum / votes.length).toFixed(1));
  }, [getProblemVotes]);
  
  const getBookmarks = useMemo(() => {
    if (!user?._id) return new Set<number>();
    const set = new Set<number>();
    data.research.forEach(r => {
      if (r.bookmarkedBy.includes(user._id)) {
        set.add(r.problemStatementId);
      }
    });
    return set;
  }, [data.research, user?._id]);

  const toggleBookmark = async (problemId: number) => {
    try {
      const updated = await researchApi.toggleBookmark(problemId);
      setData(prev => {
        const existing = prev.research.find(r => r.problemStatementId === problemId);
        if (existing) {
          return { ...prev, research: prev.research.map(r => r.problemStatementId === problemId ? updated : r) };
        }
        return { ...prev, research: [...prev.research, updated] };
      });
    } catch (e) {
      console.error(e);
    }
  };

  const updateStage = async (problemId: number, stage: PipelineStage) => {
    try {
      const updated = await researchApi.updateStage(problemId, stage);
      setData(prev => ({ ...prev, research: prev.research.map(r => r.problemStatementId === problemId ? updated : r) }));
    } catch (e) {
      console.error(e);
    }
  };
  
  const addNote = async (problemId: number, content: string) => {
    try {
      const updated = await researchApi.addNote(problemId, content);
      setData(prev => ({ ...prev, research: prev.research.map(r => r.problemStatementId === problemId ? updated : r) }));
    } catch (e) {
      console.error(e);
    }
  };

  const deleteNote = async (problemId: number, noteId: string) => {
    try {
      const updated = await researchApi.deleteNote(problemId, noteId);
      setData(prev => ({ ...prev, research: prev.research.map(r => r.problemStatementId === problemId ? updated : r) }));
    } catch (e) {
      console.error(e);
    }
  };

  const addResource = async (problemId: number, resource: Partial<any>) => {
    try {
      const updated = await researchApi.addResource(problemId, resource);
      setData(prev => ({ ...prev, research: prev.research.map(r => r.problemStatementId === problemId ? updated : r) }));
    } catch (e) {
      console.error(e);
    }
  };

  const deleteResource = async (problemId: number, resourceId: string) => {
    try {
      const updated = await researchApi.deleteResource(problemId, resourceId);
      setData(prev => ({ ...prev, research: prev.research.map(r => r.problemStatementId === problemId ? updated : r) }));
    } catch (e) {
      console.error(e);
    }
  };

  const updateTechStack = async (problemId: number, techStack: any[]) => {
    try {
      const updated = await researchApi.updateTechStack(problemId, techStack);
      setData(prev => ({ ...prev, research: prev.research.map(r => r.problemStatementId === problemId ? updated : r) }));
    } catch (e) {
      console.error(e);
    }
  };

  const finalizeProblem = async (problemId: number) => {
     try {
       await researchApi.finalizeProblem(problemId);
       await fetchResearch(); 
     } catch (e) {
       console.error(e);
     }
  };

  const addComment = async (problemId: number, message: string) => {
     try {
       const comment = await researchApi.addComment(problemId, message);
       setData(prev => ({ ...prev, comments: [...prev.comments, comment] }));
     } catch (e) {
       console.error(e);
     }
  };
  
  const deleteComment = async (problemId: number, commentId: string) => {
     try {
       await researchApi.deleteComment(problemId, commentId);
       setData(prev => ({ ...prev, comments: prev.comments.filter(c => c._id !== commentId) }));
     } catch (e) {
       console.error(e);
     }
  };
  
  const voteProblem = async (problemId: number, rating: number) => {
     try {
       const vote = await researchApi.voteProblem(problemId, rating);
       setData(prev => {
         const existing = prev.votes.find(v => v._id === vote._id);
         if (existing) {
           return { ...prev, votes: prev.votes.map(v => v._id === vote._id ? vote : v) };
         }
         return { ...prev, votes: [...prev.votes, vote] };
       });
     } catch (e) {
       console.error(e);
     }
  };

  return {
    data,
    loading,
    getBookmarks,
    getProblemResearch,
    getProblemComments,
    getProblemVotes,
    getAverageRating,
    toggleBookmark,
    updateStage,
    addNote,
    deleteNote,
    addResource,
    deleteResource,
    updateTechStack,
    finalizeProblem,
    addComment,
    deleteComment,
    voteProblem
  };
}
