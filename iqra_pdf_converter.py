import os
import sys
import fitz  # PyMuPDF
from PIL import Image
import io
from pathlib import Path
import json
import shutil

class IqraConverter:
    def __init__(self, source_dir, output_dir):
        self.source_dir = Path(source_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Iqra module information
        self.module_info = {
            1: {"title": "Huruf Hijaiyyah", "theme": "emerald", "focus": "Basic Arabic Letters"},
            2: {"title": "Fathah & Baris", "theme": "blue", "focus": "Harakat System"},
            3: {"title": "Kasrah & Sukukun", "theme": "purple", "focus": "Vowel Marks"},
            4: {"title": "Mad & Tanwin", "theme": "indigo", "focus": "Extended Vowels"},
            5: {"title": "Mad & Waqaf", "theme": "green", "focus": "Lengthening & Stops"},
            6: {"title": "Tajwid Asas", "theme": "amber", "focus": "Basic Tajwid Rules"}
        }
        
        print(f"🚀 Iqra Converter initialized")
        print(f"📁 Source: {self.source_dir}")
        print(f"📁 Output: {self.output_dir}")
    
    def convert_pdf_to_images(self, pdf_path, module_num, quality=85, dpi=150):
        """Convert PDF pages to optimized images"""
        try:
            print(f"\n📖 Converting {pdf_path.name}...")
            
            # Open PDF
            doc = fitz.open(pdf_path)
            
            # Create module directories
            module_dir = self.output_dir / f"iqra-{module_num}"
            images_dir = module_dir / "images"
            images_dir.mkdir(parents=True, exist_ok=True)
            
            pages_info = []
            
            for page_num in range(doc.page_count):
                # Get page
                page = doc[page_num]
                
                # Render page to image with high quality
                mat = fitz.Matrix(dpi/72, dpi/72)
                pix = page.get_pixmap(matrix=mat)
                
                # Convert to PIL Image
                img_data = pix.tobytes("png")
                img = Image.open(io.BytesIO(img_data))
                
                # Optimize image
                img = img.convert('RGB')  # Ensure RGB format
                
                # Resize if too large (max width 1200px for web)
                if img.width > 1200:
                    ratio = 1200 / img.width
                    new_height = int(img.height * ratio)
                    img = img.resize((1200, new_height), Image.Resampling.LANCZOS)
                
                # Save optimized image
                output_path = images_dir / f"page-{page_num + 1:02d}.jpg"
                img.save(output_path, "JPEG", quality=quality, optimize=True)
                
                pages_info.append({
                    "page_num": page_num + 1,
                    "image_path": f"./images/page-{page_num + 1:02d}.jpg",
                    "file_size": output_path.stat().st_size
                })
                
                print(f"  ✅ Page {page_num + 1:2d} → {output_path.name} ({output_path.stat().st_size // 1024}KB)")
            
            doc.close()
            
            # Save module metadata
            metadata = {
                "module": module_num,
                "title": self.module_info[module_num]["title"],
                "theme": self.module_info[module_num]["theme"],
                "focus": self.module_info[module_num]["focus"],
                "total_pages": len(pages_info),
                "pages": pages_info
            }
            
            metadata_path = module_dir / "metadata.json"
            with open(metadata_path, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, ensure_ascii=False, indent=2)
            
            print(f"  💾 Metadata saved: {len(pages_info)} pages")
            return module_dir, pages_info
            
        except Exception as e:
            print(f"❌ Error converting {pdf_path}: {e}")
            return None, []
    
    def create_html_pages(self, module_dir, module_num, pages_info):
        """Create interactive HTML pages for each PDF page"""
        try:
            module_info = self.module_info[module_num]
            theme_colors = {
                "emerald": {"primary": "#059669", "secondary": "#10b981", "bg": "#f0fdf4"},
                "blue": {"primary": "#1e40af", "secondary": "#3b82f6", "bg": "#eff6ff"},
                "purple": {"primary": "#7c3aed", "secondary": "#8b5cf6", "bg": "#f5f3ff"},
                "indigo": {"primary": "#4338ca", "secondary": "#6366f1", "bg": "#eef2ff"},
                "green": {"primary": "#16a34a", "secondary": "#22c55e", "bg": "#f0fdf4"},
                "amber": {"primary": "#d97706", "secondary": "#f59e0b", "bg": "#fffbeb"}
            }
            
            colors = theme_colors[module_info["theme"]]
            
            for i, page_info in enumerate(pages_info, 1):
                html_content = f"""<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iqra {module_num} - Halaman {i}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Scheherazade+New:wght@400;700&display=swap');
        
        body {{
            margin: 0;
            padding: 10px;
            background: linear-gradient(135deg, {colors['bg']} 0%, #f8fafc 100%);
            font-family: 'Amiri', 'Scheherazade New', serif;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }}
        
        .page-container {{
            background: white;
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.15);
            overflow: hidden;
            max-width: 95vw;
            max-height: 95vh;
            display: flex;
            flex-direction: column;
        }}
        
        .page-header {{
            background: linear-gradient(135deg, {colors['primary']} 0%, {colors['secondary']} 100%);
            color: white;
            padding: 15px 20px;
            text-align: center;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}
        
        .page-title {{
            font-size: 18px;
            font-weight: bold;
        }}
        
        .page-number {{
            background: rgba(255,255,255,0.2);
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 14px;
        }}
        
        .image-container {{
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            background: #fafafa;
        }}
        
        .page-image {{
            max-width: 100%;
            max-height: 70vh;
            width: auto;
            height: auto;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            cursor: pointer;
            transition: transform 0.3s ease;
        }}
        
        .page-image:hover {{
            transform: scale(1.02);
        }}
        
        .controls {{
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 15px 20px;
            display: flex;
            justify-content: center;
            gap: 10px;
            flex-wrap: wrap;
            border-top: 1px solid #e2e8f0;
        }}
        
        .btn {{
            background: linear-gradient(135deg, {colors['primary']} 0%, {colors['secondary']} 100%);
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 13px;
            font-weight: bold;
            transition: all 0.3s ease;
            min-width: 100px;
        }}
        
        .btn:hover {{
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.2);
        }}
        
        .progress-bar {{
            background: #e2e8f0;
            height: 4px;
            width: 100%;
        }}
        
        .progress-fill {{
            background: linear-gradient(90deg, {colors['primary']} 0%, {colors['secondary']} 100%);
            height: 100%;
            width: {(i/len(pages_info))*100:.1f}%;
            transition: width 0.3s ease;
        }}
        
        @media (max-width: 600px) {{
            .page-header {{
                padding: 10px 15px;
            }}
            
            .page-title {{
                font-size: 16px;
            }}
            
            .btn {{
                min-width: 80px;
                padding: 8px 12px;
                font-size: 12px;
            }}
        }}
    </style>
</head>
<body>
    <div class="progress-bar">
        <div class="progress-fill"></div>
    </div>
    
    <div class="page-container">
        <div class="page-header">
            <div class="page-title">
                إقرأ {module_num} - {module_info['title']}
            </div>
            <div class="page-number">
                {i} / {len(pages_info)}
            </div>
        </div>
        
        <div class="image-container">
            <img src="{page_info['image_path']}" 
                 alt="Iqra {module_num} Halaman {i}" 
                 class="page-image"
                 onclick="toggleFullscreen(this)"
                 loading="lazy">
        </div>
        
        <div class="controls">
            <button class="btn" onclick="playPageAudio()">
                🔊 Dengar
            </button>
            <button class="btn" onclick="repeatAudio()">
                🔄 Ulang
            </button>
            <button class="btn" onclick="slowAudio()">
                🐌 Perlahan
            </button>
            <button class="btn" onclick="showTajwid()">
                📖 Tajwid
            </button>
        </div>
    </div>
    
    <script>
        // Audio system
        function playPageAudio() {{
            const audio = new Audio(`../../audio/iqra/iqra{module_num}/page-{i:02d}.mp3`);
            audio.play().catch(e => {{
                console.log('Audio not available, showing visual feedback');
                showAudioFeedback();
            }});
        }}
        
        function repeatAudio() {{
            playPageAudio();
        }}
        
        function slowAudio() {{
            const audio = new Audio(`../../audio/iqra/iqra{module_num}/page-{i:02d}-slow.mp3`);
            audio.play().catch(e => playPageAudio());
        }}
        
        function showAudioFeedback() {{
            document.body.style.animation = 'pulse 0.5s ease-in-out';
            setTimeout(() => document.body.style.animation = '', 500);
        }}
        
        function showTajwid() {{
            // Show Tajwid rules overlay
            alert('Tajwid rules untuk halaman ini akan ditunjukkan di sini.\\n\\nFitur ini akan dikembangkan dengan audio dan visual guide.');
        }}
        
        function toggleFullscreen(img) {{
            if (img.requestFullscreen) {{
                img.requestFullscreen();
            }} else if (img.webkitRequestFullscreen) {{
                img.webkitRequestFullscreen();
            }} else if (img.msRequestFullscreen) {{
                img.msRequestFullscreen();
            }}
        }}
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {{
            if (e.key === 'ArrowLeft') {{
                window.parent.postMessage({{action: 'nextPage'}}, '*');
            }}
            if (e.key === 'ArrowRight') {{
                window.parent.postMessage({{action: 'prevPage'}}, '*');
            }}
            if (e.key === ' ') {{
                e.preventDefault();
                playPageAudio();
            }}
            if (e.key === 'f') {{
                const img = document.querySelector('.page-image');
                toggleFullscreen(img);
            }}
        }});
        
        // Loading animation
        document.addEventListener('DOMContentLoaded', () => {{
            const img = document.querySelector('.page-image');
            img.onload = () => {{
                img.style.opacity = '0';
                img.style.animation = 'fadeIn 0.5s ease-in-out forwards';
            }};
        }});
        
        // Add CSS for animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {{
                from {{ opacity: 0; transform: translateY(20px); }}
                to {{ opacity: 1; transform: translateY(0); }}
            }}
            @keyframes pulse {{
                0%, 100% {{ transform: scale(1); }}
                50% {{ transform: scale(1.02); }}
            }}
        `;
        document.head.appendChild(style);
    </script>
</body>
</html>"""
                
                html_path = module_dir / f"page-{i}.html"
                with open(html_path, 'w', encoding='utf-8') as f:
                    f.write(html_content)
            
            print(f"  ✅ Created {len(pages_info)} HTML pages")
            return True
            
        except Exception as e:
            print(f"❌ Error creating HTML pages: {e}")
            return False
    
    def create_module_index(self, module_dir, module_num, pages_info):
        """Create an index page for the module"""
        module_info = self.module_info[module_num]
        
        index_content = f"""<!DOCTYPE html>
<html lang="ms" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iqra {module_num} - {module_info['title']}</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
        }}
        
        .container {{
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }}
        
        .header {{
            text-align: center;
            margin-bottom: 30px;
        }}
        
        .module-title {{
            font-size: 32px;
            color: #2d3748;
            margin: 0;
        }}
        
        .pages-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 15px;
            margin: 30px 0;
        }}
        
        .page-card {{
            background: #f7fafc;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 15px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
        }}
        
        .page-card:hover {{
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            border-color: #4299e1;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="module-title">Iqra {module_num} - {module_info['title']}</h1>
            <p>Total Halaman: {len(pages_info)}</p>
        </div>
        
        <div class="pages-grid">
            {''.join([f'''
            <div class="page-card" onclick="openPage({i})">
                <div style="font-size: 24px; color: #4299e1;">📄</div>
                <div style="font-weight: bold; margin: 5px 0;">Halaman {i}</div>
                <div style="font-size: 12px; color: #666;">Klik untuk buka</div>
            </div>
            ''' for i in range(1, len(pages_info) + 1)])}
        </div>
    </div>
    
    <script>
        function openPage(pageNum) {{
            window.open(`page-${{pageNum}}.html`, '_blank');
        }}
    </script>
</body>
</html>"""
        
        index_path = module_dir / "index.html"
        with open(index_path, 'w', encoding='utf-8') as f:
            f.write(index_content)
        
        print(f"  📋 Module index created")
    
    def process_all_iqra_pdfs(self):
        """Process all Iqra PDF files"""
        pdf_files = sorted(self.source_dir.glob("*.pdf"))
        
        if not pdf_files:
            print("❌ No PDF files found in source directory")
            return
        
        print(f"📚 Found {len(pdf_files)} PDF files to process")
        print("=" * 50)
        
        total_pages = 0
        
        for pdf_path in pdf_files:
            # Extract module number from filename
            module_num = 1  # Default
            filename_lower = pdf_path.name.lower()
            
            # Try to extract module number from various patterns
            if 'jilid' in filename_lower:
                import re
                match = re.search(r'jilid[^\d]*(\d+)', filename_lower)
                if match:
                    module_num = int(match.group(1))
            elif 'iqra' in filename_lower:
                import re
                match = re.search(r'iqra[^\d]*(\d+)', filename_lower)
                if match:
                    module_num = int(match.group(1))
            else:
                # Try to find any number in filename
                import re
                numbers = re.findall(r'\d+', pdf_path.stem)
                if numbers:
                    module_num = int(numbers[0])
            
            print(f"\n🔄 Processing: {pdf_path.name} → Iqra {module_num}")
            
            # Convert PDF to images
            module_dir, pages_info = self.convert_pdf_to_images(pdf_path, module_num)
            
            if module_dir and pages_info:
                # Create HTML pages
                success = self.create_html_pages(module_dir, module_num, pages_info)
                
                if success:
                    # Create module index
                    self.create_module_index(module_dir, module_num, pages_info)
                    total_pages += len(pages_info)
                    print(f"  🎉 Module {module_num} completed: {len(pages_info)} pages")
                else:
                    print(f"  ❌ Failed to create HTML pages for module {module_num}")
            else:
                print(f"  ❌ Failed to convert PDF for module {module_num}")
        
        print("\n" + "=" * 50)
        print(f"🎉 Conversion completed!")
        print(f"📊 Total modules: {len(pdf_files)}")
        print(f"📄 Total pages: {total_pages}")
        print(f"📁 Output directory: {self.output_dir}")
        
        # Create main index
        self.create_main_index()
    
    def create_main_index(self):
        """Create main index for all modules"""
        index_content = """<!DOCTYPE html>
<html lang="ms">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Buku Iqra Lengkap - Digital Learning</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .title {
            font-size: 36px;
            color: #2d3748;
            margin: 0 0 10px 0;
        }
        
        .subtitle {
            color: #666;
            font-size: 18px;
        }
        
        .modules-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .module-card {
            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            border: 2px solid #e2e8f0;
            border-radius: 15px;
            padding: 25px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .module-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.1);
            border-color: #4299e1;
        }
        
        .module-number {
            font-size: 48px;
            margin-bottom: 15px;
        }
        
        .module-title {
            font-size: 20px;
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 10px;
        }
        
        .module-description {
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">📚 Buku Iqra Lengkap</h1>
            <p class="subtitle">Platform Pembelajaran Digital Islam</p>
        </div>
        
        <div class="modules-grid">"""
        
        for i in range(1, 7):
            if i in self.module_info:
                info = self.module_info[i]
                index_content += f"""
            <div class="module-card" onclick="openModule({i})">
                <div class="module-number">📖</div>
                <div class="module-title">Iqra {i}</div>
                <div style="color: #4299e1; font-weight: bold; margin: 5px 0;">{info['title']}</div>
                <div class="module-description">{info['focus']}</div>
            </div>"""
        
        index_content += """
        </div>
    </div>
    
    <script>
        function openModule(moduleNum) {
            window.open(`iqra-${moduleNum}/index.html`, '_blank');
        }
    </script>
</body>
</html>"""
        
        main_index_path = self.output_dir / "index.html"
        with open(main_index_path, 'w', encoding='utf-8') as f:
            f.write(index_content)
        
        print(f"📋 Main index created: {main_index_path}")

# Usage
if __name__ == "__main__":
    # Install required packages first:
    # pip install PyMuPDF Pillow
    
    source_dir = r"O:\Projects\Files\iqralengkap\Download"
    output_dir = r"o:\Repositaries\Personal\kopiahhaji.github.io\assets\iqra"
    
    converter = IqraConverter(source_dir, output_dir)
    converter.process_all_iqra_pdfs()