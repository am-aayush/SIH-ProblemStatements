export type PipelineStage = 'Available' | 'Bookmarked' | 'Researching' | 'Voting' | 'Shortlisted' | 'Final Selected';

export interface Comment {
  _id: string;
  problemStatementId: number;
  teamId: string;
  userId: { _id: string; name: string; role: string; profile?: { avatar?: string } };
  message: string;
  createdAt: string;
}

export interface Vote {
  _id: string;
  problemStatementId: number;
  userId: string;
  vote: number;
}

export interface ResearchNote {
  _id?: string;
  content: string;
  author: any;
  createdAt?: string;
}

export interface ResearchResource {
  _id?: string;
  title: string;
  url: string;
  description: string;
  category: string;
  addedBy: any;
  date?: string;
}

export interface TechStackItem {
  _id?: string;
  category: string;
  name: string;
}

export interface ProblemResearch {
  _id: string;
  problemStatementId: number;
  teamId: string;
  status: PipelineStage;
  bookmarkedBy: string[];
  notes: ResearchNote[];
  resources: ResearchResource[];
  techStack: TechStackItem[];
  isFinalSelected: boolean;
}

export interface ResearchData {
  research: ProblemResearch[];
  votes: Vote[];
  comments: Comment[];
}
