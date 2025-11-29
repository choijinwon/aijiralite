// pages/help/index.js
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  BookOpen,
  Users,
  FolderKanban,
  AlertCircle,
  Sparkles,
  Bell,
  Search,
  ChevronRight,
  HelpCircle,
  MessageSquare,
  Settings,
  BarChart3,
  Zap,
  Shield,
  Mail
} from 'lucide-react';

export default function HelpPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    {
      id: 'getting-started',
      title: '시작하기',
      icon: Zap,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Jira Lite에 오신 것을 환영합니다!</h3>
            <p className="text-gray-600 mb-4">
              Jira Lite는 팀 협업과 프로젝트 관리를 위한 간단하고 강력한 도구입니다.
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">빠른 시작 가이드</h4>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>팀을 생성하거나 기존 팀에 참여하세요</li>
              <li>프로젝트를 생성하고 이슈를 추가하세요</li>
              <li>칸반 보드에서 이슈를 관리하세요</li>
              <li>AI 기능을 활용하여 작업을 더 효율적으로 하세요</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'teams',
      title: '팀 관리',
      icon: Users,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">팀 생성 및 관리</h3>
            <p className="text-gray-600 mb-4">
              팀을 생성하고 멤버를 초대하여 협업을 시작하세요.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-600" />
                팀 생성
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Teams 페이지에서 "New Team" 클릭</li>
                <li>• 팀 이름과 설명 입력</li>
                <li>• 팀 생성 후 멤버 초대</li>
              </ul>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary-600" />
                멤버 초대
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 팀 상세 페이지에서 "Invite Member" 클릭</li>
                <li>• 이메일 주소와 역할 선택</li>
                <li>• 초대 링크가 이메일로 전송됨</li>
              </ul>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-600" />
                역할 및 권한
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>OWNER:</strong> 모든 권한</li>
                <li>• <strong>ADMIN:</strong> 팀 관리 권한</li>
                <li>• <strong>MEMBER:</strong> 기본 권한</li>
              </ul>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary-600" />
                팀 설정
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 팀 이름 및 설명 수정</li>
                <li>• 멤버 역할 변경</li>
                <li>• 팀 소유권 이전</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'projects',
      title: '프로젝트 관리',
      icon: FolderKanban,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">프로젝트 생성 및 관리</h3>
            <p className="text-gray-600 mb-4">
              프로젝트를 생성하고 이슈를 관리하여 작업을 체계적으로 추적하세요.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-primary-600" />
                프로젝트 생성
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Projects 페이지 또는 팀 페이지에서 생성</li>
                <li>• 프로젝트 이름과 설명 입력</li>
                <li>• 팀 선택 (선택사항)</li>
              </ul>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary-600" />
                프로젝트 설정
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 라벨 생성 및 관리</li>
                <li>• 커스텀 상태 추가</li>
                <li>• WIP 제한 설정</li>
              </ul>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-600" />
                칸반 보드
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 드래그 앤 드롭으로 이슈 이동</li>
                <li>• 상태별로 이슈 그룹화</li>
                <li>• 반응형 디자인 지원</li>
              </ul>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Search className="w-5 h-5 text-primary-600" />
                라벨 및 필터
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 라벨로 이슈 분류</li>
                <li>• 색상으로 시각적 구분</li>
                <li>• 라벨별 필터링 가능</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'issues',
      title: '이슈 관리',
      icon: AlertCircle,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">이슈 생성 및 추적</h3>
            <p className="text-gray-600 mb-4">
              이슈를 생성하고 관리하여 작업을 체계적으로 추적하세요.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary-600" />
                이슈 생성
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 칸반 보드에서 "New Issue" 클릭</li>
                <li>• 제목, 설명, 우선순위 입력</li>
                <li>• 담당자 및 마감일 설정</li>
                <li>• 라벨 추가</li>
              </ul>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary-600" />
                댓글 및 협업
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 이슈에 댓글 추가</li>
                <li>• 담당자와 소유자에게 알림</li>
                <li>• 이슈 히스토리 확인</li>
              </ul>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-600" />
                우선순위 및 상태
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>HIGH:</strong> 긴급한 작업</li>
                <li>• <strong>MEDIUM:</strong> 일반 작업</li>
                <li>• <strong>LOW:</strong> 낮은 우선순위</li>
                <li>• 상태: Backlog, In Progress, Done</li>
              </ul>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary-600" />
                이슈 관리 팁
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 마감일 설정으로 일정 관리</li>
                <li>• 라벨로 카테고리 분류</li>
                <li>• 담당자 지정으로 책임 명확화</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ai-features',
      title: 'AI 기능',
      icon: Sparkles,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">AI 기반 기능</h3>
            <p className="text-gray-600 mb-4">
              AI를 활용하여 이슈 관리를 더욱 효율적으로 만드세요.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-600" />
                이슈 요약
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                긴 설명을 간단하게 요약하여 빠르게 이해할 수 있습니다.
              </p>
              <p className="text-xs text-gray-500">이슈 상세 페이지에서 "Generate Summary" 클릭</p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary-600" />
                해결 방안 제안
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                이슈 해결을 위한 실용적인 제안을 받을 수 있습니다.
              </p>
              <p className="text-xs text-gray-500">이슈 상세 페이지에서 "Get Suggestions" 클릭</p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Search className="w-5 h-5 text-primary-600" />
                중복 이슈 감지
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                유사한 이슈를 자동으로 감지하여 중복을 방지합니다.
              </p>
              <p className="text-xs text-gray-500">이슈 생성 시 자동으로 검사</p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-600" />
                자동 라벨링
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                AI가 이슈 내용을 분석하여 적절한 라벨을 자동으로 제안합니다.
              </p>
              <p className="text-xs text-gray-500">"Auto Label" 버튼으로 실행</p>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">AI 사용 제한</h4>
            <p className="text-sm text-yellow-800">
              AI 기능은 분당 최대 20회까지 사용할 수 있으며, 실패 시 최대 2회까지 자동 재시도됩니다.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'notifications',
      title: '알림',
      icon: Bell,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">알림 시스템</h3>
            <p className="text-gray-600 mb-4">
              중요한 이벤트를 놓치지 않도록 알림을 받으세요.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary-600" />
                인앱 알림
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 헤더의 알림 아이콘 클릭</li>
                <li>• 미읽음 알림 개수 표시</li>
                <li>• 개별 알림 읽음 처리</li>
                <li>• 전체 읽음 처리</li>
              </ul>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary-600" />
                이메일 알림
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 이슈 담당자 지정 시</li>
                <li>• 댓글 작성 시</li>
                <li>• 마감일 임박 시</li>
                <li>• 팀 초대 시</li>
              </ul>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-2">알림 유형</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 이슈 담당자 지정</li>
                <li>• 댓글 추가</li>
                <li>• 마감일 임박 (1일 전)</li>
                <li>• 마감일 당일</li>
                <li>• 팀 초대</li>
                <li>• 역할 변경</li>
              </ul>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-2">알림 관리</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 알림 클릭으로 관련 페이지 이동</li>
                <li>• 읽음/미읽음 시각적 구분</li>
                <li>• 알림 목록에서 모든 알림 확인</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'dashboard',
      title: '대시보드',
      icon: BarChart3,
      content: (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">대시보드</h3>
            <p className="text-gray-600 mb-4">
              작업 현황을 한눈에 파악하고 통계를 확인하세요.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-600" />
                개인 대시보드
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 내가 담당한 이슈 통계</li>
                <li>• 상태별 이슈 분포</li>
                <li>• 우선순위별 분포</li>
                <li>• 최근 7일 트렌드</li>
              </ul>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-600" />
                팀 대시보드
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 팀 전체 이슈 통계</li>
                <li>• 프로젝트별 현황</li>
                <li>• 멤버별 활동</li>
                <li>• 팀 성과 지표</li>
              </ul>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-2">차트 유형</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 상태별 파이 차트</li>
                <li>• 우선순위별 바 차트</li>
                <li>• 일별 트렌드 라인 차트</li>
              </ul>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-2">주요 지표</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 총 이슈 수</li>
                <li>• 최근 이슈 수</li>
                <li>• 마감일 지난 이슈</li>
                <li>• 프로젝트 수</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'faq',
      title: '자주 묻는 질문',
      icon: HelpCircle,
      content: (
        <div className="space-y-4">
          <div className="space-y-4">
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Q: 팀에 여러 명을 한 번에 초대할 수 있나요?</h4>
              <p className="text-sm text-gray-600">
                A: 현재는 한 번에 한 명씩 초대할 수 있습니다. 각 멤버의 이메일 주소를 입력하여 개별적으로 초대해주세요.
              </p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Q: 이슈를 삭제할 수 있나요?</h4>
              <p className="text-sm text-gray-600">
                A: 네, 이슈 소유자, 프로젝트 소유자, 또는 팀 관리자(OWNER/ADMIN)는 이슈를 삭제할 수 있습니다. 삭제된 이슈는 소프트 삭제되어 복구 가능합니다.
              </p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Q: AI 기능이 작동하지 않아요</h4>
              <p className="text-sm text-gray-600">
                A: AI 기능을 사용하려면 .env 파일에 OPENAI_API_KEY 또는 ANTHROPIC_API_KEY를 설정해야 합니다. API 키가 올바르게 설정되어 있는지 확인하고 서버를 재시작해주세요.
              </p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Q: 이메일 알림을 받지 못해요</h4>
              <p className="text-sm text-gray-600">
                A: 이메일 알림을 받으려면 .env 파일에 SMTP 설정(SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)이 필요합니다. 설정이 올바른지 확인해주세요.
              </p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Q: 커스텀 상태는 어떻게 사용하나요?</h4>
              <p className="text-sm text-gray-600">
                A: 프로젝트 설정 페이지에서 커스텀 상태를 추가할 수 있습니다. 각 상태에 색상과 WIP(Work In Progress) 제한을 설정할 수 있습니다.
              </p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-2">Q: 프로필 사진을 변경할 수 있나요?</h4>
              <p className="text-sm text-gray-600">
                A: 현재는 Google OAuth를 통해 로그인한 경우 Google 프로필 사진이 사용됩니다. 추후 프로필 사진 업로드 기능이 추가될 예정입니다.
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const activeSectionData = sections.find(s => s.id === activeSection) || sections[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold">도움말 및 가이드</h1>
          </div>
          <p className="text-gray-600">Jira Lite 사용 방법을 알아보세요</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-4">
              <h2 className="font-semibold mb-4">목차</h2>
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                        activeSection === section.id
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {section.title}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                {activeSectionData.icon && (
                  <activeSectionData.icon className="w-6 h-6 text-primary-600" />
                )}
                <h2 className="text-2xl font-bold">{activeSectionData.title}</h2>
              </div>
              <div className="prose max-w-none">
                {activeSectionData.content}
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => {
                  const currentIndex = sections.findIndex(s => s.id === activeSection);
                  if (currentIndex > 0) {
                    setActiveSection(sections[currentIndex - 1].id);
                  }
                }}
                disabled={sections.findIndex(s => s.id === activeSection) === 0}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              <button
                onClick={() => {
                  const currentIndex = sections.findIndex(s => s.id === activeSection);
                  if (currentIndex < sections.length - 1) {
                    setActiveSection(sections[currentIndex + 1].id);
                  }
                }}
                disabled={sections.findIndex(s => s.id === activeSection) === sections.length - 1}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold mb-4">빠른 링크</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BarChart3 className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-medium">대시보드</span>
            </Link>
            <Link
              href="/teams"
              className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-medium">팀 관리</span>
            </Link>
            <Link
              href="/projects"
              className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FolderKanban className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-medium">프로젝트</span>
            </Link>
            <Link
              href="/profile"
              className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-5 h-5 text-primary-600" />
              <span className="text-sm font-medium">프로필 설정</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

