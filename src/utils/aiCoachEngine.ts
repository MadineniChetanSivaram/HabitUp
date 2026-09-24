import { Habit, OverallStats, UserProfile } from '../types';

export interface CoachContextData {
  habits: Habit[];
  overallStats?: OverallStats;
  user?: UserProfile | null;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export function generateSmartCoachResponse(
  userQuery: string,
  context: CoachContextData
): string {
  const query = userQuery.trim().toLowerCase();
  const activeHabits = (context.habits || []).filter(
    (h) => !h.archived_at && !h.deleted_at && !h.paused_at
  );
  const userName = context.user?.name || 'Friend';
  const bestStreak = context.overallStats?.currentBestStreak ?? 0;
  const completionRate = context.overallStats?.completionRate ?? 0;

  // Identify top habit (longest streak) and struggling habit (lowest streak)
  const sortedHabits = [...activeHabits].sort((a, b) => {
    const sA = (a as any).streak ?? (a as any).currentStreak ?? 0;
    const sB = (b as any).streak ?? (b as any).currentStreak ?? 0;
    return sB - sA;
  });

  const topHabit = sortedHabits[0];
  const strugglingHabit = sortedHabits[sortedHabits.length - 1];

  // 1. Weekly / Progress Review
  if (
    query.includes('how am i doing') ||
    query.includes('this week') ||
    query.includes('progress') ||
    query.includes('stats') ||
    query.includes('review') ||
    query.includes('performance')
  ) {
    const habitSummary = activeHabits.length > 0
      ? activeHabits.map(h => `• **${h.name}**: ${String((h as any).streak ?? (h as any).currentStreak ?? 0)} day streak`).join('\n')
      : 'No active habits yet';

    return (
      `Here is your habit momentum check, ${userName} 📊✨\n\n` +
      `🔥 **Current Best Streak**: ${bestStreak} days\n` +
      `🎯 **Active Habits**: ${activeHabits.length}\n` +
      (completionRate > 0 ? `📈 **Completion Consistency**: ${Math.round(completionRate)}%\n\n` : '\n') +
      `**Your Habit Streaks:**\n${habitSummary}\n\n` +
      (bestStreak >= 7
        ? `Incredible dedication! You have crossed the 7-day threshold where habits begin cementing into identity. Keep protecting your streak!`
        : `You are in the critical foundation-building phase. Every checkmark this week compounds into identity. Let's finish today strong!`)
    );
  }

  // 2. What habit to focus on
  if (
    query.includes('what habit') ||
    query.includes('focus on') ||
    query.includes('prioritize') ||
    query.includes('where to start') ||
    query.includes('which one')
  ) {
    if (strugglingHabit && sortedHabits.length > 1) {
      const lowStreak = (strugglingHabit as any).streak ?? (strugglingHabit as any).currentStreak ?? 0;
      return (
        `I recommend focusing your energy on **"${strugglingHabit.name}"** today 🎯\n\n` +
        `• Current streak: **${lowStreak} days**\n` +
        `• **Action tip**: Use the "2-Minute Rule". Make the initial action ridiculously easy to start so resistance is zero.\n` +
        (topHabit
          ? `• **Habit Stacking**: Pair it right after **"${topHabit.name}"** (your strongest habit at ${String((topHabit as any).streak ?? 0)} days). For example: *"After I finish ${topHabit.name}, I will immediately do ${strugglingHabit.name}."*`
          : `• Set a dedicated alarm 15 minutes before you usually do it.`)
      );
    }

    if (topHabit) {
      return (
        `Your anchor habit right now is **"${topHabit.name}"** with a **${String((topHabit as any).streak ?? 0)}-day streak**! 🌟\n\n` +
        `Keep this as your non-negotiable core. When your anchor habit is checked off early in the day, the psychological momentum makes all other habits easier to accomplish.`
      );
    }

    return (
      `To get started, pick just **one keystone habit** that has the biggest ripple effect on your day—like drinking water first thing in the morning or 10 minutes of reading. Master one before adding three!`
    );
  }

  // 3. Consistency Tips
  if (
    query.includes('consistency') ||
    query.includes('consistent') ||
    query.includes('tips to build') ||
    query.includes('stick to') ||
    query.includes('habit stacking')
  ) {
    const tips = [
      `Here are 3 proven principles for unbreakable consistency ⚡:\n\n` +
        `1. **Never Miss Twice**: Missing one day is an accident; missing two is the start of a new habit. Even on low-energy days, do a mini-version (e.g., 2 push-ups instead of 20).\n\n` +
        `2. **Habit Stacking**: Attach your habit to a behavior you already do daily without thinking (*"After I pour my morning coffee, I will..."*).\n\n` +
        `3. **Visual Cues**: Keep your cue front-and-center. If it's reading, leave the book on your pillow. If it's water, keep the bottle filled on your desk.`,

      `To build rock-solid consistency, remember the **Identity Shift** rule 🧠:\n\n` +
        `Instead of saying *"I want to run"*, say *"I am a runner"*. Every time you complete a habit, you cast a vote for the type of person you want to become.\n\n` +
        `• **Reduce friction**: Make starting take under 20 seconds.\n` +
        `• **Track visually**: Your streak in HabitUp is your proof of showing up. Protect the flame! 🔥`,
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  }

  // 4. Motivation & Mindset
  if (
    query.includes('motivated') ||
    query.includes('motivation') ||
    query.includes('lazy') ||
    query.includes('procrastinat') ||
    query.includes('hard to start') ||
    query.includes('feel like')
  ) {
    return (
      `Here's a golden truth: **Action produces motivation, not the other way around** 🔥\n\n` +
      `Waiting to "feel like doing it" is a trap. Professionals act before motivation arrives.\n\n` +
      `Try the **5-Second Rule** right now:\n` +
      `Count down *"5 - 4 - 3 - 2 - 1"* and physically move to start your habit for just 60 seconds. Once you cross the starting line, inertia does the rest!\n\n` +
      `What habit can we knock out together right now?`
    );
  }

  // 5. Specific Habits: Sleep
  if (query.includes('sleep') || query.includes('bedtime') || query.includes('wake up') || query.includes('night')) {
    return (
      `Great sleep is the multiplier for all other habits 🌙😴\n\n` +
      `• **Set a Reverse Alarm**: Put an alarm 45 minutes before bedtime signaling it's time to dim lights and put the phone away.\n` +
      `• **Screen Sunset**: Blue light suppresses melatonin. Try switching phone to grayscale or reading a physical book.\n` +
      `• **Consistency > Duration**: Waking up at the same hour every day anchors your circadian rhythm better than sleeping in.`
    );
  }

  // 6. Specific Habits: Exercise / Fitness / Running / Workout
  if (
    query.includes('exercise') ||
    query.includes('workout') ||
    query.includes('gym') ||
    query.includes('run') ||
    query.includes('walk') ||
    query.includes('fitness')
  ) {
    return (
      `For fitness habits, success is won the night before 🏃‍♂️💪\n\n` +
      `• **Prep your gear**: Lay out your workout clothes and shoes right beside your bed or workspace.\n` +
      `• **Lower the activation bar**: On busy days, do a 5-minute stretch or 10 squats. Keeping the streak alive matters more than workout intensity.\n` +
      `• **Tie it to music or podcasts**: Make your workout the only time you listen to your favorite playlist!`
    );
  }

  // 7. Specific Habits: Reading / Learning / Study
  if (query.includes('read') || query.includes('book') || query.includes('study') || query.includes('learn')) {
    return (
      `The key to daily reading is micro-commitments 📚✨\n\n` +
      `• **The 2-Page Rule**: Commit only to reading 2 pages each day. If you want to continue, great! If not, you still won the day.\n` +
      `• **Prime your environment**: Keep your book on your pillow or coffee table—never hidden in a drawer.\n` +
      `• **Swap 10 minutes of social media**: Replace your first morning phone scroll with 5 minutes of reading.`
    );
  }

  // 8. Specific Habits: Water / Hydration / Nutrition
  if (query.includes('water') || query.includes('drink') || query.includes('hydrat') || query.includes('diet') || query.includes('food')) {
    return (
      `Hydration is the easiest high-impact win of the day 💧⚡\n\n` +
      `• **The Morning Water Rule**: Drink a full glass of water within 5 minutes of waking up before your coffee.\n` +
      `• **Visual Water Bottle**: Keep a clear, marked bottle directly in your peripheral vision while working.\n` +
      `• **Anchor to breaks**: Every time you stand up from your chair, take 3 sips.`
    );
  }

  // 9. Routine building (Morning / Evening)
  if (query.includes('morning routine') || query.includes('morning')) {
    return (
      `Design an intentional Morning Routine in 3 simple phases ☀️:\n\n` +
      `1. **Hydrate & Awaken**: 1 glass of water + 2 minutes of sunlight or fresh air.\n` +
      `2. **Move**: A quick stretch or walk to signal wakefulness to your nervous system.\n` +
      `3. **Key Win**: Complete your most important habit before opening email or social media.`
    );
  }

  if (query.includes('evening') || query.includes('night routine')) {
    return (
      `An Evening Routine sets up tomorrow's victories 🌙:\n\n` +
      `1. **Brain Dump**: Write tomorrow's top 3 tasks on paper to clear mental clutter.\n` +
      `2. **Environment Reset**: Spend 3 minutes clearing your desk and prepping clothes.\n` +
      `3. **Wind Down**: Dim screens, drink chamomile or water, and read a few pages.`
    );
  }

  // 10. Greetings & Coach Intro
  if (query === 'hi' || query === 'hello' || query === 'hey' || query.includes('who are you')) {
    return (
      `Hello ${userName}! 👋 I'm your AI Smart Coach.\n\n` +
      `I'm here to analyze your streaks, provide research-backed behavioral coaching, and help you lock in consistent daily habits.\n\n` +
      `You can ask me things like:\n` +
      `• *"How am I doing this week?"*\n` +
      `• *"What habit should I focus on?"*\n` +
      `• *"Tips to build consistency"*\n` +
      `• Or ask about any specific habit you're building!`
    );
  }

  // 11. General Habit Coaching Response
  return (
    `Great question about habit growth, ${userName} 🌱\n\n` +
    `When tackling *"**${userQuery.trim()}**"*, keep the Golden Habit Loop in mind:\n\n` +
    `1. **Make the Cue Obvious**: Set a specific time, place, or existing trigger.\n` +
    `2. **Make the Action Easy**: Reduce steps so starting takes under 60 seconds.\n` +
    `3. **Make the Reward Immediate**: Track your checkmark in HabitUp right after finishing.\n\n` +
    (activeHabits.length > 0
      ? `You have **${activeHabits.length} active habits** in your journey right now. Pick one small improvement to test today!`
      : `Would you like me to suggest a foundational habit to start with today?`)
  );
}
