export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  relevance: number;
}

export interface KnowledgeBaseSearcher {
  search(query: string): Promise<KnowledgeDocument[]>;
}
