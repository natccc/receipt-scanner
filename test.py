from PIL import Image
import pytesseract
text= pytesseract.image_to_string(Image.open('2.png'))
lines = text.split('\n')
for line in lines:
    if "£" in line:
        print(line)