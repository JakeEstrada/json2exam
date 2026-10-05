export function parseRoute(pathname) {
  const parts = String(pathname || '/')
    .split('?')[0]
    .split('#')[0]
    .split('/')
    .filter(Boolean)
    .map((part) => {
      try { return decodeURIComponent(part); } catch (e) { return part; }
    });
  if (!parts.length) return { screen: 'home' };
  if (parts[0] === 'lesson') return { screen: 'lesson' };
  if (parts[0] === 'quiz') return { screen: 'quiz' };
  if (parts[0] === 'c' && parts[1]) {
    const courseId = parts[1];
    if (!parts[2]) return { screen: 'course', courseId };
    const deckId = parts[2];
    if (parts[3] === 'quiz') return { screen: 'quiz', courseId, deckId };
    return { screen: 'lesson', courseId, deckId };
  }
  return { screen: 'home' };
}

export function routePath(route) {
  if (!route || route.screen === 'home' || route.screen === 'load') return '/';
  if (route.screen === 'course' && route.courseId) {
    return '/c/' + encodeURIComponent(route.courseId);
  }
  if (route.courseId && route.deckId && (route.screen === 'lesson' || route.screen === 'quiz' || route.screen === 'done')) {
    const base = '/c/' + encodeURIComponent(route.courseId) + '/' + encodeURIComponent(route.deckId);
    return route.screen === 'lesson' ? base : base + '/quiz';
  }
  if (route.screen === 'lesson') return '/lesson';
  if (route.screen === 'quiz' || route.screen === 'done') return '/quiz';
  return '/';
}

export function routeTrail(route) {
  const screen = route && route.screen;
  if (!screen || screen === 'home' || screen === 'load') return [{ screen: 'home' }];
  const steps = [{ screen: 'home' }];
  if (route.courseId && (screen === 'course' || screen === 'lesson' || screen === 'quiz' || screen === 'done')) {
    steps.push({ screen: 'course', courseId: route.courseId });
  }
  if (route.courseId && route.deckId && (screen === 'lesson' || screen === 'quiz' || screen === 'done')) {
    steps.push({ screen: 'lesson', courseId: route.courseId, deckId: route.deckId });
  }
  if ((screen === 'quiz' || screen === 'done') && route.courseId && route.deckId) {
    steps.push({ screen: 'quiz', courseId: route.courseId, deckId: route.deckId });
  } else if (screen === 'quiz' || screen === 'done') {
    steps.push({ screen: 'quiz' });
  } else if (screen === 'lesson' && !(route.courseId && route.deckId)) {
    steps.push({ screen: 'lesson' });
  }
  return steps;
}
