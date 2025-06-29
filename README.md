# LifeScore: Your Life is Your Adventure

Live Demo

LifeScore transforms personal development into a great journey. It's a Life RPG designed to help you build a healthier, more balanced life, directly addressing **UN Sustainable Development Goal 3: Good Health and Well-being.**

[Screenshots]
*Note: To make this screenshot work, create a folder named `docs` in your project, add your screenshot image named `screenshot.png` to it, and commit the changes.*

---

## The Problem: The Motivation Gap in Well-being

 We all know we *should* exercise, learn, and build positive routines. The biggest challenge isn't knowing what to do; it's staying motivated to do it consistently. Traditional to-do lists are boring and often feel like a chore.

## Our Solution: A Role-Playing Game for Your Life

LifeScore closes the motivation gap by turning self-improvement into a game you want to play.

We took the engaging mechanics of Role-Playing Games (RPGs) and applied them to real-life goals. Instead of a boring checklist, your daily tasks become quests. Your successes earn you tangible rewards like XP. Your efforts are reflected in character stats that you build over time. It’s not just a to-do list; **it’s a role-playing game where you are the hero.**

## Core Features

*   **Daily Quests:** Add Habits, Dailies, and To-Dos for your mind and body.
*   **Personal Stats:** Level up your character's Strength, Intelligence, Endurance, and Wisdom as you complete your real-life quests.
*   **Reward System:** Earn XP and Gold for staying consistent, and watch your character's HP and Level grow.
*   **Journey With Others:** A community feature to share progress and milestones, fostering a supportive environment for growth.
*   **Secure Authentication:** Easy and secure sign-in.

## Tech Stack

LifeScore is built fully with bolt.new, full-stack TypeScript architecture, demonstrating a robust and scalable approach to web development.

*   **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
*   **Database ORM:** [Prisma](https://www.prisma.io/)
*   **Authentication:** [NextAuth.js](https://next-auth.js.org/)
*   **UI Components:** [Shadcn/UI](https://ui.shadcn.com/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Schema Validation:** [Zod](https://zod.dev/)
*   **Deployment:** Vercel

## Running Locally

1.  Clone the repository:
    ```bash
    git clone https://github.com/bernie9991/lifescore.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd lifescore
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Set up your `.env` file by copying the example:
    ```bash
    cp .env.example .env
    ```
5.  Fill in the required environment variables in your new `.env` file.
6.  Run the development server:
    ```bash
    npm run dev
    ```
