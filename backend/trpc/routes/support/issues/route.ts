import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import type { Issue, IssueComment, IssueStats, MonthlyIssueReport, YearlyIssueReport } from "../../../../../types/support";

const mockIssues: Issue[] = [];
const mockComments: IssueComment[] = [];

export const createIssueProcedure = protectedProcedure
  .input(
    z.object({
      title: z.string(),
      description: z.string(),
      category: z.enum(['payment', 'debt', 'account', 'technical', 'other']),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const issue: Issue = {
      id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: input.title,
      description: input.description,
      category: input.category,
      priority: input.priority || 'medium',
      status: 'open',
      reportedBy: ctx.user.id,
      reportedByName: ctx.user.name,
      reportedByRole: ctx.user.role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockIssues.push(issue);
    console.log(`[Support] Issue created: ${issue.id} by ${ctx.user.name}`);

    return { success: true, issue };
  });

export const getIssuesProcedure = protectedProcedure
  .input(
    z.object({
      status: z.array(z.enum(['open', 'in_progress', 'resolved', 'closed'])).optional(),
      priority: z.array(z.enum(['low', 'medium', 'high', 'urgent'])).optional(),
      category: z.array(z.enum(['payment', 'debt', 'account', 'technical', 'other'])).optional(),
      reportedBy: z.string().optional(),
      assignedTo: z.string().optional(),
    }).optional()
  )
  .query(async ({ input, ctx }) => {
    let filteredIssues = [...mockIssues];

    if (ctx.user.role === 'customer') {
      filteredIssues = filteredIssues.filter(i => i.reportedBy === ctx.user.id);
    } else if (ctx.user.role === 'employee') {
      filteredIssues = filteredIssues.filter(
        i => i.assignedTo === ctx.user.id || i.reportedBy === ctx.user.id
      );
    }

    if (input?.status && input.status.length > 0) {
      filteredIssues = filteredIssues.filter(i => input.status!.includes(i.status));
    }

    if (input?.priority && input.priority.length > 0) {
      filteredIssues = filteredIssues.filter(i => input.priority!.includes(i.priority));
    }

    if (input?.category && input.category.length > 0) {
      filteredIssues = filteredIssues.filter(i => input.category!.includes(i.category));
    }

    if (input?.reportedBy) {
      filteredIssues = filteredIssues.filter(i => i.reportedBy === input.reportedBy);
    }

    if (input?.assignedTo) {
      filteredIssues = filteredIssues.filter(i => i.assignedTo === input.assignedTo);
    }

    return filteredIssues.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });

export const getIssueProcedure = protectedProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input, ctx }) => {
    const issue = mockIssues.find(i => i.id === input.id);
    
    if (!issue) {
      throw new Error('کێشەکە نەدۆزرایەوە');
    }

    if (ctx.user.role === 'customer' && issue.reportedBy !== ctx.user.id) {
      throw new Error('دەسەڵاتت نییە بۆ بینینی ئەم کێشەیە');
    }

    return issue;
  });

export const updateIssueProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      assignedTo: z.string().optional(),
      assignedToName: z.string().optional(),
      resolutionNotes: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    if (ctx.user.role === 'customer') {
      throw new Error('دەسەڵاتت نییە بۆ نوێکردنەوەی کێشە');
    }

    const issueIndex = mockIssues.findIndex(i => i.id === input.id);
    if (issueIndex === -1) {
      throw new Error('کێشەکە نەدۆزرایەوە');
    }

    const issue = mockIssues[issueIndex];
    const updates: Partial<Issue> = {
      updatedAt: new Date().toISOString(),
    };

    if (input.status) {
      updates.status = input.status;
      if (input.status === 'resolved' || input.status === 'closed') {
        updates.resolvedAt = new Date().toISOString();
        updates.resolvedBy = ctx.user.id;
        updates.resolvedByName = ctx.user.name;
      }
    }

    if (input.priority) updates.priority = input.priority;
    if (input.assignedTo) updates.assignedTo = input.assignedTo;
    if (input.assignedToName) updates.assignedToName = input.assignedToName;
    if (input.resolutionNotes) updates.resolutionNotes = input.resolutionNotes;

    mockIssues[issueIndex] = { ...issue, ...updates };

    console.log(`[Support] Issue updated: ${input.id} by ${ctx.user.name}`);

    return { success: true, issue: mockIssues[issueIndex] };
  });

export const rateIssueProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      rating: z.number().min(1).max(5),
      comment: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const issueIndex = mockIssues.findIndex(i => i.id === input.id);
    if (issueIndex === -1) {
      throw new Error('کێشەکە نەدۆزرایەوە');
    }

    const issue = mockIssues[issueIndex];
    
    if (issue.reportedBy !== ctx.user.id) {
      throw new Error('تەنها کەسی ڕاپۆرتکەر دەتوانێت هەڵسەنگاندن بکات');
    }

    if (issue.status !== 'resolved' && issue.status !== 'closed') {
      throw new Error('تەنها کێشەی چارەسەرکراو دەتوانرێت هەڵسەنگاندن بکرێت');
    }

    mockIssues[issueIndex] = {
      ...issue,
      rating: input.rating,
      ratingComment: input.comment,
      updatedAt: new Date().toISOString(),
    };

    console.log(`[Support] Issue rated: ${input.id} - ${input.rating}/5 by ${ctx.user.name}`);

    return { success: true, issue: mockIssues[issueIndex] };
  });

export const addCommentProcedure = protectedProcedure
  .input(
    z.object({
      issueId: z.string(),
      comment: z.string(),
      isInternal: z.boolean().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const issue = mockIssues.find(i => i.id === input.issueId);
    if (!issue) {
      throw new Error('کێشەکە نەدۆزرایەوە');
    }

    if (ctx.user.role === 'customer' && input.isInternal) {
      throw new Error('کڕیار ناتوانێت تێبینی ناوخۆیی زیاد بکات');
    }

    const comment: IssueComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      issueId: input.issueId,
      userId: ctx.user.id,
      userName: ctx.user.name,
      userRole: ctx.user.role,
      comment: input.comment,
      createdAt: new Date().toISOString(),
      isInternal: input.isInternal || false,
    };

    mockComments.push(comment);

    const issueIndex = mockIssues.findIndex(i => i.id === input.issueId);
    mockIssues[issueIndex].updatedAt = new Date().toISOString();

    console.log(`[Support] Comment added to issue ${input.issueId} by ${ctx.user.name}`);

    return { success: true, comment };
  });

export const getCommentsProcedure = protectedProcedure
  .input(z.object({ issueId: z.string() }))
  .query(async ({ input, ctx }) => {
    const issue = mockIssues.find(i => i.id === input.issueId);
    if (!issue) {
      throw new Error('کێشەکە نەدۆزرایەوە');
    }

    let comments = mockComments.filter(c => c.issueId === input.issueId);

    if (ctx.user.role === 'customer') {
      comments = comments.filter(c => !c.isInternal);
    }

    return comments.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  });

export const getIssueStatsProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    if (ctx.user.role === 'customer') {
      throw new Error('دەسەڵاتت نییە بۆ بینینی ئاماری کێشەکان');
    }

    const stats: IssueStats = {
      totalIssues: mockIssues.length,
      openIssues: mockIssues.filter(i => i.status === 'open').length,
      inProgressIssues: mockIssues.filter(i => i.status === 'in_progress').length,
      resolvedIssues: mockIssues.filter(i => i.status === 'resolved').length,
      closedIssues: mockIssues.filter(i => i.status === 'closed').length,
      averageResolutionTime: 0,
      averageRating: 0,
      issuesByCategory: [
        { category: 'payment', count: mockIssues.filter(i => i.category === 'payment').length },
        { category: 'debt', count: mockIssues.filter(i => i.category === 'debt').length },
        { category: 'account', count: mockIssues.filter(i => i.category === 'account').length },
        { category: 'technical', count: mockIssues.filter(i => i.category === 'technical').length },
        { category: 'other', count: mockIssues.filter(i => i.category === 'other').length },
      ],
      issuesByPriority: [
        { priority: 'low', count: mockIssues.filter(i => i.priority === 'low').length },
        { priority: 'medium', count: mockIssues.filter(i => i.priority === 'medium').length },
        { priority: 'high', count: mockIssues.filter(i => i.priority === 'high').length },
        { priority: 'urgent', count: mockIssues.filter(i => i.priority === 'urgent').length },
      ],
    };

    const resolvedIssues = mockIssues.filter(i => i.resolvedAt);
    if (resolvedIssues.length > 0) {
      const totalResolutionTime = resolvedIssues.reduce((sum, issue) => {
        const created = new Date(issue.createdAt).getTime();
        const resolved = new Date(issue.resolvedAt!).getTime();
        return sum + (resolved - created);
      }, 0);
      stats.averageResolutionTime = totalResolutionTime / resolvedIssues.length / (1000 * 60 * 60);
    }

    const ratedIssues = mockIssues.filter(i => i.rating);
    if (ratedIssues.length > 0) {
      stats.averageRating = ratedIssues.reduce((sum, i) => sum + (i.rating || 0), 0) / ratedIssues.length;
    }

    return stats;
  });

export const getMonthlyIssueReportProcedure = protectedProcedure
  .input(z.object({ month: z.string() }))
  .query(async ({ input, ctx }) => {
    if (ctx.user.role === 'customer') {
      throw new Error('دەسەڵاتت نییە بۆ بینینی ڕاپۆرتی مانگانە');
    }

    const [year, month] = input.month.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

    const monthIssues = mockIssues.filter(i => {
      const issueDate = new Date(i.createdAt);
      return issueDate >= startDate && issueDate <= endDate;
    });

    const resolvedIssues = monthIssues.filter(i => i.resolvedAt);
    
    let averageResolutionTime = 0;
    if (resolvedIssues.length > 0) {
      const totalTime = resolvedIssues.reduce((sum, issue) => {
        const created = new Date(issue.createdAt).getTime();
        const resolved = new Date(issue.resolvedAt!).getTime();
        return sum + (resolved - created);
      }, 0);
      averageResolutionTime = totalTime / resolvedIssues.length / (1000 * 60 * 60);
    }

    const ratedIssues = monthIssues.filter(i => i.rating);
    const averageRating = ratedIssues.length > 0
      ? ratedIssues.reduce((sum, i) => sum + (i.rating || 0), 0) / ratedIssues.length
      : 0;

    const report: MonthlyIssueReport = {
      month: input.month,
      totalIssues: monthIssues.length,
      resolvedIssues: resolvedIssues.length,
      averageResolutionTime,
      averageRating,
      issuesByCategory: [
        { category: 'payment', count: monthIssues.filter(i => i.category === 'payment').length },
        { category: 'debt', count: monthIssues.filter(i => i.category === 'debt').length },
        { category: 'account', count: monthIssues.filter(i => i.category === 'account').length },
        { category: 'technical', count: monthIssues.filter(i => i.category === 'technical').length },
        { category: 'other', count: monthIssues.filter(i => i.category === 'other').length },
      ],
    };

    return report;
  });

export const getYearlyIssueReportProcedure = protectedProcedure
  .input(z.object({ year: z.string() }))
  .query(async ({ input, ctx }) => {
    if (ctx.user.role === 'customer') {
      throw new Error('دەسەڵاتت نییە بۆ بینینی ڕاپۆرتی ساڵانە');
    }

    const yearNum = parseInt(input.year);
    const startDate = new Date(yearNum, 0, 1);
    const endDate = new Date(yearNum, 11, 31, 23, 59, 59);

    const yearIssues = mockIssues.filter(i => {
      const issueDate = new Date(i.createdAt);
      return issueDate >= startDate && issueDate <= endDate;
    });

    const monthlyBreakdown: MonthlyIssueReport[] = [];
    for (let month = 1; month <= 12; month++) {
      const monthStr = `${yearNum}-${month.toString().padStart(2, '0')}`;
      const monthStart = new Date(yearNum, month - 1, 1);
      const monthEnd = new Date(yearNum, month, 0, 23, 59, 59);

      const monthIssues = yearIssues.filter(i => {
        const issueDate = new Date(i.createdAt);
        return issueDate >= monthStart && issueDate <= monthEnd;
      });

      const resolvedIssues = monthIssues.filter(i => i.resolvedAt);
      
      let averageResolutionTime = 0;
      if (resolvedIssues.length > 0) {
        const totalTime = resolvedIssues.reduce((sum, issue) => {
          const created = new Date(issue.createdAt).getTime();
          const resolved = new Date(issue.resolvedAt!).getTime();
          return sum + (resolved - created);
        }, 0);
        averageResolutionTime = totalTime / resolvedIssues.length / (1000 * 60 * 60);
      }

      const ratedIssues = monthIssues.filter(i => i.rating);
      const averageRating = ratedIssues.length > 0
        ? ratedIssues.reduce((sum, i) => sum + (i.rating || 0), 0) / ratedIssues.length
        : 0;

      monthlyBreakdown.push({
        month: monthStr,
        totalIssues: monthIssues.length,
        resolvedIssues: resolvedIssues.length,
        averageResolutionTime,
        averageRating,
        issuesByCategory: [
          { category: 'payment', count: monthIssues.filter(i => i.category === 'payment').length },
          { category: 'debt', count: monthIssues.filter(i => i.category === 'debt').length },
          { category: 'account', count: monthIssues.filter(i => i.category === 'account').length },
          { category: 'technical', count: monthIssues.filter(i => i.category === 'technical').length },
          { category: 'other', count: monthIssues.filter(i => i.category === 'other').length },
        ],
      });
    }

    const resolvedIssues = yearIssues.filter(i => i.resolvedAt);
    
    let averageResolutionTime = 0;
    if (resolvedIssues.length > 0) {
      const totalTime = resolvedIssues.reduce((sum, issue) => {
        const created = new Date(issue.createdAt).getTime();
        const resolved = new Date(issue.resolvedAt!).getTime();
        return sum + (resolved - created);
      }, 0);
      averageResolutionTime = totalTime / resolvedIssues.length / (1000 * 60 * 60);
    }

    const ratedIssues = yearIssues.filter(i => i.rating);
    const averageRating = ratedIssues.length > 0
      ? ratedIssues.reduce((sum, i) => sum + (i.rating || 0), 0) / ratedIssues.length
      : 0;

    const report: YearlyIssueReport = {
      year: input.year,
      totalIssues: yearIssues.length,
      resolvedIssues: resolvedIssues.length,
      averageResolutionTime,
      averageRating,
      monthlyBreakdown,
    };

    return report;
  });
