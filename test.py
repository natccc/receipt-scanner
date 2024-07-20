from PIL import Image
import pytesseract
text= pytesseract.image_to_string(Image.open('5.jpg'))
lines = text.split('\n')
for line in lines:
    if "£" in line:
        print(line)


