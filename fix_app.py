
import os

path = r'c:\Users\User\Documents\APP SOFTWARE\APPPC\TRADE\App.tsx'

with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Removing the specific redundant block that includes t('managed_aum') in AssetFactoryView
# Based on previous views, it was around lines 1380 or such.
# Let's find the specific block for AssetFactoryView's indicators.

new_lines = []
skip = False
for i, line in enumerate(lines):
    # Detect the block we want to remove
    if 'managed_aum' in line and 'AssetFactoryView' in ''.join(lines[i-50:i]):
        # This is likely the indicators block.
        # We need to be careful not to remove the one in the header.
        pass

# Actually, I'll just apply the structural fix to the end of AssetFactoryView component
# which I know has the extra </div>.

output = []
for i, line in enumerate(lines):
    # Line 1689 was the extra </div> (0-indexed 1688)
    if i == 1688 and '</div>' in line:
        continue # skip the extra div
    
    # Also replace the alert at 1711 (0-indexed 1710)
    if i == 1710 and "alert('Code copied!');" in line:
        line = line.replace("alert('Code copied!');", "showModal('SUCCESS', language === 'pt' ? 'Código Copiado' : 'Code Copied', language === 'pt' ? 'O código fonte foi copiado para a área de transferência.' : 'The source code has been copied to the clipboard.');")
    
    output.append(line)

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(output)

print("Fixed.")
