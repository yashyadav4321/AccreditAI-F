'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Star, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { sssService, SurveyQuestion } from '@/lib/services/sssService';

export default function PublicSurveyPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [survey, setSurvey] = useState<any>(null);
    const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [respondentInfo, setRespondentInfo] = useState({ name: '', email: '', department: '', year: '' });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await sssService.getPublicSurvey(slug);
                const data = res.data.data;
                setSurvey(data);
                setQuestions(data.questions || []);
            } catch {
                toast.error('Survey not found or no longer available');
            } finally { setLoading(false); }
        })();
    }, [slug]);

    const handleSubmit = async () => {
        // Check required
        const missingRequired = questions.filter(q => q.isRequired && !answers[q.id]);
        if (missingRequired.length > 0) {
            toast.error(`Please answer all required questions (${missingRequired.length} unanswered)`);
            return;
        }
        setSubmitting(true);
        try {
            const formattedAnswers = Object.entries(answers).map(([questionId, value]) => ({
                questionId,
                rating: questions.find(q => q.id === questionId)?.questionType === 'RATING' ? parseInt(value) : undefined,
                textResponse: questions.find(q => q.id === questionId)?.questionType !== 'RATING' ? value : undefined,
            }));

            await sssService.submitResponse(survey.id, {
                studentId: respondentInfo.email || 'anonymous',
                departmentCode: respondentInfo.department || undefined,
                answers: formattedAnswers.map(a => ({
                    questionId: a.questionId,
                    ratingValue: a.rating,
                    textValue: a.textResponse,
                })),
            });
            setSubmitted(true);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to submit');
        } finally { setSubmitting(false); }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!survey) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Card className="max-w-md">
                    <CardContent className="p-8 text-center">
                        <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h2 className="text-xl font-bold">Survey Not Found</h2>
                        <p className="text-muted-foreground mt-2">This survey may have been closed or the link is invalid.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, type: 'spring' }}>
                    <Card className="max-w-md">
                        <CardContent className="p-8 text-center">
                            <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-emerald-400" />
                            <h2 className="text-2xl font-bold">Thank You!</h2>
                            <p className="text-muted-foreground mt-2">Your response has been recorded successfully.</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-8 px-4">
            <div className="max-w-2xl mx-auto space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
                        <CardHeader>
                            <CardTitle className="text-2xl">{survey.title}</CardTitle>
                            {survey.description && <CardDescription className="text-base">{survey.description}</CardDescription>}
                            <p className="text-xs text-muted-foreground mt-2">Academic Year: {survey.academicYear}</p>
                        </CardHeader>
                    </Card>
                </motion.div>

                {/* Respondent Info */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                    <Card>
                        <CardHeader><CardTitle className="text-base">Your Information (Optional)</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2"><Label className="text-xs">Name</Label><Input value={respondentInfo.name} onChange={e => setRespondentInfo({ ...respondentInfo, name: e.target.value })} placeholder="Your name" /></div>
                            <div className="grid gap-2"><Label className="text-xs">Email</Label><Input value={respondentInfo.email} onChange={e => setRespondentInfo({ ...respondentInfo, email: e.target.value })} placeholder="your@email.com" /></div>
                            <div className="grid gap-2"><Label className="text-xs">Department</Label><Input value={respondentInfo.department} onChange={e => setRespondentInfo({ ...respondentInfo, department: e.target.value })} placeholder="Department" /></div>
                            <div className="grid gap-2"><Label className="text-xs">Year of Study</Label><Input value={respondentInfo.year} onChange={e => setRespondentInfo({ ...respondentInfo, year: e.target.value })} placeholder="e.g. 3rd Year" /></div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Questions */}
                {questions.map((q, i) => (
                    <motion.div key={q.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 + i * 0.05 }}>
                        <Card>
                            <CardContent className="p-5">
                                <div className="flex items-start gap-2 mb-4">
                                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-foreground/10 text-xs font-medium shrink-0">{i + 1}</span>
                                    <div>
                                        <p className="text-sm font-medium">{q.questionText}</p>
                                        {q.isRequired && <span className="text-[10px] text-red-400">Required</span>}
                                    </div>
                                </div>

                                {q.questionType === 'RATING' ? (
                                    <div className="flex items-center justify-center gap-6 py-4">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                onClick={() => setAnswers({ ...answers, [q.id]: star.toString() })}
                                                className={`flex flex-col items-center gap-1 transition-all ${parseInt(answers[q.id]) >= star ? 'scale-110' : 'opacity-50 hover:opacity-80'}`}
                                            >
                                                <Star className={`h-8 w-8 transition-colors ${parseInt(answers[q.id]) >= star ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
                                                <span className="text-xs">{star}</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : q.questionType === 'MULTIPLE_CHOICE' ? (
                                    <RadioGroup value={answers[q.id] || ''} onValueChange={(v: string) => setAnswers({ ...answers, [q.id]: v })}>
                                        {(q.options || ['Option A', 'Option B', 'Option C', 'Option D']).map((opt: string) => (
                                            <div key={opt} className="flex items-center space-x-2 py-1">
                                                <RadioGroupItem value={opt} id={`${q.id}-${opt}`} />
                                                <Label htmlFor={`${q.id}-${opt}`} className="text-sm">{opt}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                ) : (
                                    <Textarea
                                        value={answers[q.id] || ''}
                                        onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })}
                                        placeholder="Type your response..."
                                        rows={3}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}

                {/* Submit */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                    <Button size="lg" className="w-full" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting...</> : <><Send className="h-4 w-4 mr-2" />Submit Response</>}
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}
