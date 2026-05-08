import os
out = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'src', 'screens', 'HomeScreen.js')
with open(out, 'a', encoding='utf-8') as f:
    f.write(r"""
const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: THEME.colors.background },
  blob:         { position: 'absolute', width: width * 1.2, height: width * 1.2, borderRadius: 9999, opacity: 0.1, backgroundColor: THEME.colors.primary },
  blobTop:      { top: -width * 0.6, right: -width * 0.3 },
  scrollContent: { paddingHorizontal: THEME.spacing.lg },

  headerRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: THEME.spacing.md, marginBottom: THEME.spacing.lg },
  greeting:     { color: THEME.colors.textSecondary, fontSize: 15, fontWeight: '500' },
  headerTitle:  { fontSize: 30, fontWeight: '800', color: THEME.colors.textPrimary, letterSpacing: -0.5, marginTop: 2 },
  iconBtn:      { width: 48, height: 48, borderRadius: 24, backgroundColor: THEME.colors.cardSecondary, justifyContent: 'center', alignItems: 'center' },

  heroCard: {
    backgroundColor: THEME.colors.card, borderRadius: THEME.borderRadius.lg, padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.xl, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
    borderWidth: 1, borderColor: 'rgba(215,230,90,0.08)',
  },
  heroTextContainer: { flex: 1, paddingRight: 12 },
  quoteHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  heroLabel:   { color: THEME.colors.textSecondary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  heroTitle:   { color: THEME.colors.textPrimary, fontSize: 17, fontWeight: '800', lineHeight: 25, marginBottom: 6 },
  quoteAuthor: { color: THEME.colors.primary, fontSize: 13, fontWeight: '700' },
  heroIcon:    { opacity: 0.85 },

  quickActionsRow: { flexDirection: 'row', marginBottom: THEME.spacing.xl, gap: 8 },
  actionChip:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: THEME.colors.card, paddingVertical: 14, borderRadius: THEME.borderRadius.xl, gap: 6 },
  actionChipText: { color: THEME.colors.textPrimary, fontWeight: '700', fontSize: 13 },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: THEME.spacing.md, marginTop: THEME.spacing.sm },
  sectionTitle: { color: THEME.colors.textPrimary, fontSize: 20, fontWeight: '800' },
  seeAllText:   { color: THEME.colors.primary, fontSize: 14, fontWeight: '700' },
  trendingMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  lastUpdatedText: { color: THEME.colors.textSecondary, fontSize: 11, fontWeight: '600' },
  aiChip:       { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, gap: 4 },
  aiChipText:   { color: THEME.colors.textDark, fontSize: 12, fontWeight: '800' },

  gridRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: THEME.spacing.lg, gap: 10 },
  gridItem: {
    flex: 1, alignItems: 'center', backgroundColor: THEME.colors.card,
    paddingVertical: THEME.spacing.md, borderRadius: THEME.borderRadius.md,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  iconWrapper:  { padding: 10, borderRadius: 16, marginBottom: 8 },
  gridNumber:   { color: THEME.colors.textPrimary, fontSize: 20, fontWeight: '800' },
  gridLabel:    { color: THEME.colors.textSecondary, fontSize: 12, fontWeight: '600', marginTop: 2 },

  hScrollContent: { paddingBottom: 12, paddingRight: 24 },

  recCard: {
    width: 260, backgroundColor: THEME.colors.card, borderRadius: THEME.borderRadius.lg,
    marginRight: 16, padding: 16, borderWidth: 1, borderColor: THEME.colors.border,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, elevation: 5,
  },
  recHeaderRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  recTopic:      { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  trendingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.colors.primary, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20, gap: 3 },
  trendingText:  { color: THEME.colors.textDark, fontSize: 10, fontWeight: '800' },
  recTitle:      { color: THEME.colors.textPrimary, fontSize: 15, fontWeight: '800', lineHeight: 22, marginBottom: 8 },
  recPreview:    { color: THEME.colors.textSecondary, fontSize: 13, lineHeight: 19, marginBottom: 12 },
  recFooter:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  recSourceRow:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  recSource:     { color: THEME.colors.textSecondary, fontSize: 12, fontWeight: '600' },
  recReadRow:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  recReadTime:   { color: THEME.colors.textSecondary, fontSize: 12, fontWeight: '600' },
  recAiBox:      { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.colors.cardSecondary, padding: 8, borderRadius: 10, gap: 6 },
  recAiText:     { color: THEME.colors.textSecondary, fontSize: 12, lineHeight: 16, flex: 1 },

  linkCard: { width: 200, backgroundColor: THEME.colors.card, borderRadius: THEME.borderRadius.lg, marginRight: 14, overflow: 'hidden', borderWidth: 1, borderColor: THEME.colors.border },
  linkThumbnail: { width: '100%', height: 95, backgroundColor: THEME.colors.background },
  linkIconFallback: { width: '100%', height: 95, backgroundColor: THEME.colors.background, justifyContent: 'center', alignItems: 'center' },
  linkContent:   { padding: 12 },
  linkTitle:     { color: THEME.colors.textPrimary, fontSize: 14, fontWeight: '700', marginBottom: 4, lineHeight: 20 },
  linkDomain:    { color: THEME.colors.textSecondary, fontSize: 12, marginBottom: 8 },
  linkFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  linkCategory:  { color: THEME.colors.textSecondary, fontSize: 12, fontWeight: '600' },

  emptyHorizontal: { width: width - 48, alignItems: 'center', justifyContent: 'center', paddingVertical: 36, backgroundColor: THEME.colors.card, borderRadius: THEME.borderRadius.lg, borderWidth: 1, borderColor: THEME.colors.border },
  emptyState:  { alignItems: 'center', justifyContent: 'center', paddingVertical: 50, backgroundColor: THEME.colors.card, borderRadius: THEME.borderRadius.lg, borderWidth: 1, borderColor: THEME.colors.border },
  emptyText:   { color: THEME.colors.textSecondary, marginTop: 10, fontSize: 14, fontWeight: '500' },

  fabContainer: { position: 'absolute', right: 20, alignItems: 'flex-end', zIndex: 10 },
  fabMainBtn:   { width: 62, height: 62, borderRadius: 31, backgroundColor: THEME.colors.primary, justifyContent: 'center', alignItems: 'center', shadowColor: THEME.colors.primary, shadowOpacity: 0.4, shadowRadius: 12, elevation: 10 },
  fabMenuBtn:   { position: 'absolute', flexDirection: 'row', alignItems: 'center', right: 4, bottom: 4 },
  fabSubBtn:    { width: 54, height: 54, borderRadius: 27, backgroundColor: THEME.colors.cardSecondary, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  fabSubLabel:  { color: THEME.colors.textPrimary, backgroundColor: THEME.colors.card, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, marginRight: 14, fontSize: 14, fontWeight: '700', overflow: 'hidden' },
});
""")

print("STYLES_DONE")
