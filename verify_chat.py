src = open(r'C:\Users\kalpe\Downloads\Medsense_AI-main (5)\Medsense_AI-main\Downloads\Medsense_AI-main (2)\Medsense_AI-main\src\pages\Chat.jsx', encoding='utf-8').read()

checks = [
    ('History removed from SIDEBAR_SECTIONS', 'history' not in src.split('SIDEBAR_SECTIONS')[1].split(']')[0]),
    ('RECENT_CHATS removed', 'RECENT_CHATS' not in src),
    ('Give me some ideas removed', 'Give me some ideas' not in src),
    ('EXPLORE_CARDS present', 'EXPLORE_CARDS' in src),
    ('TEMPLATE_GROUPS present', 'TEMPLATE_GROUPS' in src),
    ('renderExplorePanel present', 'renderExplorePanel' in src),
    ('renderTemplatesPanel present', 'renderTemplatesPanel' in src),
    ('renderFilesPanel present', 'renderFilesPanel' in src),
    ('reportsApi imported', 'reportsApi' in src),
    ('Brain icon imported', 'Brain' in src),
    ('HeartPulse icon imported', 'HeartPulse' in src),
    ('activeSection defaults to explore', "useState('explore')" in src),
    ('AnimatePresence used in sidebar', src.count('AnimatePresence') >= 2),
    ('userReports state present', 'userReports' in src),
    ('Files panel fetches reports', 'reportsApi.list()' in src),
    ('Templates send to chat', 'sendMessage(item)' in src),
    ('Explore cards fire queries', 'sendMessage(card.query)' in src),
    ('File lines', str(len(src.splitlines()))),
]

all_pass = True
for label, result in checks:
    status = '✅' if result is True else ('ℹ️' if isinstance(result, str) else '❌')
    if result is False:
        all_pass = False
    print(f'{status} {label}: {result}')

print()
print('ALL PASS ✅' if all_pass else 'SOME CHECKS FAILED ❌')
