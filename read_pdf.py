import Quartz
import sys

def extract_text(pdf_path):
    url = Quartz.CFURLCreateFromFileSystemRepresentation(None, pdf_path.encode('utf-8'), len(pdf_path), False)
    pdf = Quartz.CGPDFDocumentCreateWithURL(url)
    if pdf is None:
        print("Failed to open PDF.")
        return
        
    for i in range(1, Quartz.CGPDFDocumentGetNumberOfPages(pdf) + 1):
        page = Quartz.CGPDFDocumentGetPage(pdf, i)
        page_dict = Quartz.CGPDFPageGetDictionary(page)
        # Text extraction via CoreGraphics is complex, let's just use pdftotext or equivalent
        
