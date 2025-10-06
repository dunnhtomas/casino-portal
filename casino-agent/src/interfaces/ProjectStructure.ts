/**
 * Project Structure Interface
 * Single responsibility: Define project file and directory structure
 */

export interface ProjectStructure {
  casinoDataPath: string;
  componentPaths: {
    layout: string;
    casino: string;
    sections: string;
  };
  pagePaths: {
    reviews: string;
    bonuses: string;
    games: string;
    best: string;
  };
  managerPaths: {
    seo: string;
    navigation: string;
    rating: string;
  };
}