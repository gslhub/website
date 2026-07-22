# GSLHub Scientific Content Model

## Purpose

GSLHub treats research outputs as connected entities rather than isolated pages. A publication may be linked to authors, research areas, datasets, software and benchmarks. This structure will later map directly to Payload CMS collections and PostgreSQL relations.

## Core entities

### Research area

Defines a stable line of investigation.

Required fields:
- slug
- title
- summary
- keywords

### Researcher

Represents an author, team member or collaborator.

Required fields:
- slug
- full name
- role
- biography
- research interests

Optional identifiers:
- ORCID
- Google Scholar
- GitHub
- LinkedIn

### Publication

Represents an article, preprint, conference paper, report or book chapter.

Required fields:
- slug
- title
- abstract
- status
- year
- authors
- keywords

Optional relations and identifiers:
- DOI
- PDF
- repository
- datasets
- software

### Software

Represents a research-related application, library, plugin or reproducible implementation.

Required fields:
- slug
- name
- summary
- status

Optional fields:
- license
- repository
- related publications
- related datasets

### Dataset

Represents a documented collection of observations or research data.

Required fields:
- slug
- name
- summary
- status

Optional fields:
- license
- DOI
- repository
- related publications

## Lifecycle statuses

Publications:
`concept → in-progress → preprint → published`

Software:
`planned → development → released`

Datasets:
`planned → collecting → published`

## Payload CMS mapping

The first CMS integration will create collections for:

1. Users
2. Researchers
3. Research Areas
4. Publications
5. Software
6. Datasets
7. Projects
8. Media

Relations must be bidirectional at the application layer so each entity page can expose its connected research graph.

## Metadata requirements

Every public research entity must support:

- canonical URL
- title and description
- Open Graph metadata
- Schema.org JSON-LD
- stable slug
- publication/update dates
- citation and license information where applicable

## Editorial principle

No item should be presented as published research until its status and evidence support that claim. Planned and in-progress outputs must be clearly labelled.
