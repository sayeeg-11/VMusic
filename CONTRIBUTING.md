# Contribution Guidelines – VMusic

Thank you for contributing to **VMusic – Indie Music Streaming Web App**, a project participating in **Winter of Code Social 2025**.  
Please follow this guide carefully to ensure your contributions are properly tracked and scored.

---

## Contribution Process

1. **Fork** this repository.
2. **Clone** your fork locally.
   
  ```sh
    git clone https://github.com/mr-baraiya/VMusic.git
   ```
3. Create a new branch:

   ```sh
   git checkout -b feature/my-feature
   ```
4. Make changes and test locally.
5. Stage and commit:

   ```sh
   git add .
   git commit -m "feat: added new feature"
   ```
6. Push the branch:

   ```sh
   git push origin feature/my-feature
   ```
7. Open a **Pull Request** (PR).
8. **IMPORTANT → Apply required labels before merge**.

---

## Required Labels (For WOC Scoring)

| Label     | Meaning                        | Points |
| --------- | ------------------------------ | ------ |
| `wocs`    | Required for every PR          | –      |
| `level 1` | Beginner-level contribution    | 2      |
| `level 2` | Intermediate contribution      | 5      |
| `level 3` | Advanced or major contribution | 11     |

Labels **must be lowercase with correct spacing**, e.g.:

```
wocs
level 1
level 2
level 3
```

Incorrect examples:

```
Level1, LEVEL 1, level1, level  2  (double space)
```

**Labels must be added BEFORE merging.** PRs merged without correct labels will not count in leaderboard scoring.

---

## Branch Naming Convention

```
feature/add-music-player
fix/authentication-issue
docs/update-readme
```

---

## Code Style Guidelines

* Use **React functional components** with hooks.
* Follow **Tailwind CSS utility-first styling**.
* Ensure code is clean, readable, and properly commented.
* Keep component structure modular.
* Secure credentials using environment variables.

### Run checks before submitting:

```sh
npm run dev         # Test locally
npm run lint        # ESLint check
```

---

## Testing Suggestions

Before submitting your PR:
✔ Confirm UI does not break responsiveness
✔ Verify playback and API integration
✔ Ensure no warnings/errors in console

---

## 🔍 Review & Merge Policy

| Stage                | Description             |
| -------------------- | ----------------------- |
| Initial Review    | Mentor/Admin reviews PR |
| Level Assigned    | Correct level tag added |
| Changes Required  | Contributor updates PR  |
| Approved & Merged | Points awarded          |

---

## Communication Channels

* Project discussion on **Discord forum** (link coming soon).
* For help, tag mentors or the project admin.
* Use GitHub **Issues** and **PR comments** for technical queries.

---

## Good First Issues

New contributors should look for issues labeled:

```
wocs + level 1 + good first issue
```

These are beginner-friendly and help you get started easily!

---

## Thank You for Contributing

Your work improves the music experience for indie lovers worldwide!
Each contribution, no matter how small, brings us closer to the next great feature.

🎵 *Feel the Indie Beat. Free. Forever.*
— **Team VMusic**
