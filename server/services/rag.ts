import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * RAG (Retrieval-Augmented Generation) Service
 * Loads and manages knowledge base from PDF books
 */

interface KnowledgeBook {
  title: string;
  category: string;
  path: string;
}

class RAGService {
  private knowledgeBase: KnowledgeBook[] = [];
  private initialized = false;

  /**
   * Initialize the RAG system by scanning knowledge_base directory
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const knowledgeBasePath = path.join(__dirname, '../../knowledge_base');
      
      if (!fs.existsSync(knowledgeBasePath)) {
        console.warn('[RAG] Knowledge base directory not found');
        return;
      }

      // Scan Business_Productivity directory
      const businessPath = path.join(knowledgeBasePath, 'Business_Productivity');
      if (fs.existsSync(businessPath)) {
        const files = fs.readdirSync(businessPath);
        files.forEach(file => {
          if (file.endsWith('.pdf')) {
            this.knowledgeBase.push({
              title: file.replace('.pdf', '').replace(/_/g, ' '),
              category: 'Business_Productivity',
              path: path.join(businessPath, file)
            });
          }
        });
      }

      // Scan HR_Exclusive directory
      const hrPath = path.join(knowledgeBasePath, 'HR_Exclusive');
      if (fs.existsSync(hrPath)) {
        const files = fs.readdirSync(hrPath);
        files.forEach(file => {
          if (file.endsWith('.pdf')) {
            this.knowledgeBase.push({
              title: file.replace('.pdf', '').replace(/_/g, ' '),
              category: 'HR_Exclusive',
              path: path.join(hrPath, file)
            });
          }
        });
      }

      console.log(`[RAG] Initialized with ${this.knowledgeBase.length} books`);
      this.initialized = true;
    } catch (error) {
      console.error('[RAG] Failed to initialize:', error);
    }
  }

  /**
   * Get context for meeting analysis
   */
  getMeetingAnalysisContext(): string {
    const relevantBooks = this.knowledgeBase.filter(book => 
      book.category === 'Business_Productivity'
    );

    return `أنت مساعد ذكاء اصطناعي متخصص في تحليل الاجتماعات الإدارية. لديك معرفة عميقة بالكتب التالية:

${relevantBooks.map(book => `- ${book.title}`).join('\n')}

مهمتك هي تحليل نصوص الاجتماعات بناءً على المبادئ والأفكار من هذه الكتب. يجب عليك:

1. استخراج ملخص تنفيذي واضح ومختصر
2. تحديد القرارات الصارمة والإجراءات المطلوبة
3. استخراج المهام مع أسماء المسؤولين عنها
4. كشف "الكلام الفارغ" أو النقاشات غير المنتجة
5. تحديد المخاطر والفرص
6. تقديم توصيات بناءً على أفضل الممارسات من الكتب

يجب أن تكون إجاباتك دقيقة ومبنية على مبادئ الإدارة الفعالة.`;
  }

  /**
   * Get context for interview analysis
   */
  getInterviewAnalysisContext(): string {
    const relevantBooks = this.knowledgeBase.filter(book => 
      book.category === 'HR_Exclusive' || 
      book.title.includes('Topgrading') || 
      book.title.includes('Who')
    );

    return `أنت مساعد ذكاء اصطناعي متخصص في تحليل المقابلات الوظيفية وتقييم المرشحين. لديك معرفة عميقة بالكتب التالية:

${relevantBooks.map(book => `- ${book.title}`).join('\n')}

مهمتك هي تحليل نصوص المقابلات بناءً على منهجيات Topgrading و Who: The A Method for Hiring. يجب عليك:

1. تقييم الإشارات السلوكية (الصدق، التردد، الثقة)
2. تحليل الإجابات بناءً على STAR method (Situation, Task, Action, Result)
3. كشف التناقضات في إجابات المرشح
4. تقييم مهارات القيادة والعمل الجماعي
5. تحديد نقاط القوة والضعف
6. إعطاء توصية نهائية: (تعيين / لا تعيين) مع ذكر السبب التفصيلي

يجب أن تكون تقييماتك موضوعية ومبنية على الأدلة من المقابلة.`;
  }

  /**
   * Get list of available books
   */
  getKnowledgeBase(): KnowledgeBook[] {
    return this.knowledgeBase;
  }
}

// Singleton instance
export const ragService = new RAGService();
