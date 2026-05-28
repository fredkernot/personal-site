// src/content.config.ts

import { defineCollection} from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  // Load every .md file inside src/content/projects/.
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),

  schema: z.object({
    title: z.string(),              // required text
    description: z.string(),        // required one-liner for the card
    date: z.coerce.date(),          // see note below on `coerce`
    tech: z.array(z.string()),      // a list of strings, e.g. ["Docker", "Proxmox"]
  }),
});


export const collections = { projects };