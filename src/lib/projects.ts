export interface Project {
  name: string;
  description: string;
  repository: string;
}

export function parseProjects(source: string): Project[] {
  return source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line, index) => {
      const fields = line.split("|").map((field) => field.trim());
      if (fields.length !== 3 || fields.some((field) => !field)) {
        throw new Error(
          `Invalid project on line ${index + 1}. Use: name | description | repository URL`,
        );
      }

      const [name, description, repository] = fields;
      const url = new URL(repository);
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error(`Invalid project URL for ${name}: ${repository}`);
      }

      return { name, description, repository };
    });
}
