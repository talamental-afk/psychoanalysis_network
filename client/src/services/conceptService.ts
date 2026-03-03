import { conceptNodes, conceptLinks } from '../psychoanalysis_data';
import type { Node, Link } from '../types/network';

class ConceptService {
  async getAllConcepts(): Promise<Node[]> {
    return conceptNodes;
  }

  async getConceptById(id: string): Promise<Node | null> {
    return conceptNodes.find((c) => c.id === id) || null;
  }

  async getConceptsByCategory(category: string): Promise<Node[]> {
    return conceptNodes.filter((c) => c.category === category);
  }

  async getConceptsBySchool(school: string): Promise<Node[]> {
    return conceptNodes.filter((c) => c.school === school);
  }

  async getLinksForConcept(conceptId: string): Promise<Link[]> {
    return conceptLinks.filter(
      (l) => l.source === conceptId || l.target === conceptId
    );
  }

  async searchConcepts(query: string): Promise<Node[]> {
    const q = query.toLowerCase();
    return conceptNodes.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }

  async getRelatedConcepts(conceptId: string): Promise<Node[]> {
    const links = await this.getLinksForConcept(conceptId);
    const relatedIds = new Set<string>();

    links.forEach((link) => {
      if (link.source === conceptId) relatedIds.add(link.target);
      if (link.target === conceptId) relatedIds.add(link.source);
    });

    return conceptNodes.filter((c) => relatedIds.has(c.id));
  }

  async getCircularLogicConcepts(): Promise<Node[]> {
    return conceptNodes.filter((c) => c.hasCircularLogic);
  }

  async getConceptsByLevel(level: number): Promise<Node[]> {
    return conceptNodes.filter((c) => c.level === level);
  }

  async getConceptsWithCircularLogic(): Promise<
    Array<{
      concept: Node;
      explanation: string;
      argumentProcess: string;
      logicalProblem: string;
    }>
  > {
    return conceptNodes
      .filter((c) => c.hasCircularLogic)
      .map((c) => ({
        concept: c,
        explanation: c.circularLogicExplanation || '',
        argumentProcess: c.argumentProcess || '',
        logicalProblem: c.logicalProblem || '',
      }));
  }
}

export const conceptService = new ConceptService();
