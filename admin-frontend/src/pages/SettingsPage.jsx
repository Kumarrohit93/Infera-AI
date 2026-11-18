import { useState, useRef, useId } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../services/api';
import {
  Building2,
  Cpu,
  ShieldCheck,
  Boxes,
  UserCog,
  Upload,
  Save,
  LogOut,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const SETTINGS_STORAGE_KEY = 'infera_admin_settings_v1';

const DEFAULT_ORG = {
  name: 'Infera Enterprise Solutions Pvt. Ltd.',
  domain: 'infera.ai',
  logoName: 'Infera_AI_logo_vector.svg',
  logoPreview: null
};

const DEFAULT_AI = {
  provider: 'OpenAI Enterprise',
  model: 'gpt-4o (128k Context)',
  temperature: 0.2,
  topK: 4,
  chunkSize: 800,
  embeddingModel: 'text-embedding-3-large',
  strictGrounding: true
};

const DEFAULT_PERMISSIONS = {
  viewExcerpts: true,
  allowDownloads: true,
  autoAssignGeneral: true,
  enforce2FA: true,
  defaultFolderAccess: 'Restricted (Explicit Member Selection)'
};

const DEFAULT_INTEGRATIONS = [
  {
    id: 'gdrive',
    name: 'Google Drive Workspace',
    status: 'Connected',
    description: 'Auto-sync approved PDF and DOCX files from shared departmental drives.',
    actionText: 'Disconnect',
    actionStyle: 'border-[#E8DCD1] text-[#77716B] hover:text-[#A83833] hover:border-[#F3C9C6]'
  },
  {
    id: 'slack',
    name: 'Slack Knowledge Bot',
    status: 'Connected',
    description: 'Allow team members to query @InferaAI directly inside Slack channels.',
    actionText: 'Configure',
    actionStyle: 'border-[#E8DCD1] text-[#77716B] hover:text-[#96613F] hover:border-[#96613F]'
  },
  {
    id: 'notion',
    name: 'Notion Internal Wiki',
    status: 'Available',
    description: 'Ingest engineering handbooks and operational SOP pages automatically.',
    actionText: 'Connect',
    actionStyle: 'bg-[#96613F] text-white hover:bg-[#4A3023]'
  },
  {
    id: 'sharepoint',
    name: 'Microsoft SharePoint',
    status: 'Available',
    description: 'Enterprise connector for legal and compliance document libraries.',
    actionText: 'Connect',
    actionStyle: 'bg-[#96613F] text-white hover:bg-[#4A3023]'
  }
];

const DEFAULT_PROFILE = {
  name: 'Jiya Sharma',
  email: 'jiyasharma@infera.ai',
  role: 'Workspace Admin',
  currentPassword: '',
  newPassword: ''
};

function loadSavedSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const TABS = [
  { id: 'organization', label: 'Organization', icon: Building2 },
  { id: 'ai-model', label: 'AI & Model', icon: Cpu },
  { id: 'access', label: 'Access & Permissions', icon: ShieldCheck },
  { id: 'integrations', label: 'Integrations', icon: Boxes },
  { id: 'general', label: 'General', icon: UserCog }
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logoInputRef = useRef(null);
  const logoGradId = useId();
  const [activeTab, setActiveTab] = useState('organization');
  const { data: account } = useQuery({
    queryKey: ['current-user'],
    queryFn: authApi.getCurrentUser,
    retry: false,
  });

  const [savedInitial] = useState(() => loadSavedSettings());

  // Tab 1: Organization State
  const [orgData, setOrgData] = useState(() => ({
    ...DEFAULT_ORG,
    ...(savedInitial?.orgData || {})
  }));
  const [orgData, setOrgData] = useState({
    name: '',
    domain: '',
    logoName: 'No organization logo uploaded',
    logoPreview: null
  });

  // Tab 2: AI & Model State
  const [aiData, setAiData] = useState(() => ({
    ...DEFAULT_AI,
    ...(savedInitial?.aiData || {})
  }));

  // Tab 3: Access & Permissions State
  const [permissions, setPermissions] = useState(() => ({
    ...DEFAULT_PERMISSIONS,
    ...(savedInitial?.permissions || {})
  }));

  // Tab 4: Integrations State
  const [integrations, setIntegrations] = useState(() =>
    Array.isArray(savedInitial?.integrations)
      ? savedInitial.integrations
      : DEFAULT_INTEGRATIONS
  );

  // Tab 5: General / Admin Profile State
  const [profileData, setProfileData] = useState(() => ({
    ...DEFAULT_PROFILE,
    ...(savedInitial?.profileData || {}),
  const integrations = [
    {
      id: 'gdrive',
      name: 'Google Drive Workspace',
      status: 'Unavailable',
      description: 'Auto-sync approved PDF and DOCX files from shared departmental drives.',
      actionText: 'Not available',
      actionStyle: 'border-[#E8DCD1] text-[#77716B] hover:text-[#A83833] hover:border-[#F3C9C6]'
    },
    {
      id: 'slack',
      name: 'Slack Knowledge Bot',
      status: 'Unavailable',
      description: 'Allow team members to query @InferaAI directly inside Slack channels.',
      actionText: 'Not available',
      actionStyle: 'border-[#E8DCD1] text-[#77716B] hover:text-[#96613F] hover:border-[#96613F]'
    },
    {
      id: 'notion',
      name: 'Notion Internal Wiki',
      status: 'Unavailable',
      description: 'Ingest engineering handbooks and operational SOP pages automatically.',
      actionText: 'Not available',
      actionStyle: 'bg-[#96613F] text-white hover:bg-[#4A3023]'
    },
    {
      id: 'sharepoint',
      name: 'Microsoft SharePoint',
      status: 'Unavailable',
      description: 'Enterprise connector for legal and compliance document libraries.',
      actionText: 'Not available',
      actionStyle: 'bg-[#96613F] text-white hover:bg-[#4A3023]'
    }
  ];

  // Tab 5: General / Admin Profile State
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    role: 'Workspace Admin',
    currentPassword: '',
    newPassword: ''
  }));

  const persistSettings = (overrides = {}) => {
    try {
      const nextProfile = {
        name: (overrides.profileData ?? profileData).name,
        email: (overrides.profileData ?? profileData).email,
        role: (overrides.profileData ?? profileData).role
      };
      const payload = {
        orgData: overrides.orgData ?? orgData,
        aiData: overrides.aiData ?? aiData,
        permissions: overrides.permissions ?? permissions,
        integrations: overrides.integrations ?? integrations,
        profileData: nextProfile
      };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(payload));
      queryClient.setQueryData(['adminProfile'], nextProfile);
    } catch {
      // Ignore storage quota errors
    }
  };

  // TanStack Mutation for saving settings
  const saveSettingsMutation = useMutation({
    mutationFn: async (message) => {
      // Persist locally until PATCH /api/organizations/current is connected
      persistSettings();
      return message;
    },
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      toast.success(message);
    }
  });

  const handleSave = (message) => {
    saveSettingsMutation.mutate(message);
  const handleSave = () => {
    toast.error('Settings changes are not saved: the backend does not expose a settings endpoint yet.');
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo file must be under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const updatedOrg = {
        ...orgData,
        logoName: file.name,
        logoPreview: typeof reader.result === 'string' ? reader.result : null
      };
      setOrgData(updatedOrg);
      persistSettings({ orgData: updatedOrg });
      toast.success(`Logo "${file.name}" uploaded.`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleIntegrationAction = (item) => {
    if (item.actionText === 'Configure') {
      toast.success(`${item.name} is connected and active.`);
      return;
    }

    const willConnect = item.status !== 'Connected';
    const updatedList = integrations.map((intItem) =>
      intItem.id === item.id
        ? {
            ...intItem,
            status: willConnect ? 'Connected' : 'Available',
            actionText: willConnect ? 'Disconnect' : 'Connect',
            actionStyle: willConnect
              ? 'border-[#E8DCD1] text-[#77716B] hover:text-[#A83833] hover:border-[#F3C9C6]'
              : 'bg-[#96613F] text-white hover:bg-[#4A3023]'
          }
        : intItem
    );

    setIntegrations(updatedList);
    persistSettings({ integrations: updatedList });
    toast.success(`${item.name} ${willConnect ? 'connected' : 'disconnected'}.`);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('isAdminAuth');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('infera_admin_query_cache_v1');
    queryClient.clear();
    toast.success('Logged out successfully.');
    navigate('/login', { replace: true });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#25211E] tracking-tight">
          Workspace Settings
        </h2>
        <p className="text-xs sm:text-sm text-[#77716B] mt-1">
          Manage organization branding, AI retrieval hyperparameters, permissions, and account security.
        </p>
        <p className="mt-3 rounded-lg border border-[#E8DCD1] bg-white px-3 py-2 text-xs text-[#77716B]">
          Organization profile details are loaded from the auth backend. Settings, password changes, and external integrations are not writable because these backend endpoints are not implemented yet.
        </p>
      </div>

      {/* 2. Main 2-Column Vertical Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Vertical Navigation Menu */}
        <div className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[14px] p-2 sm:p-2.5 shadow-sm space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-[10px] text-xs sm:text-sm font-semibold transition-all duration-150 text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#F3E8DC] text-[#4A3023] border border-[#E8DCD1] shadow-2xs'
                    : 'text-[#77716B] hover:bg-[#FAF7F2] hover:text-[#25211E]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-[#96613F]' : ''}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Tab Content Panel (3 Cols) */}
        <div className="lg:col-span-3">
          {/* TAB 1: ORGANIZATION */}
          {activeTab === 'organization' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[14px] p-6 sm:p-8 shadow-sm space-y-8"
            >
              <div>
                <h3 className="text-base font-bold text-[#25211E] tracking-tight">Organization Profile</h3>
                <p className="text-xs text-[#77716B] mt-1">
                  Configure your company identity and verified email domain.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                <div>
                  <label className="block font-semibold text-[#25211E] mb-1.5">
                    Organization Legal Name
                  </label>
                  <input
                    type="text"
                    value={orgData.name || account?.organization?.name || ''}
                    onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[10px] text-[#25211E] font-medium focus:bg-white focus:outline-none focus:border-[#96613F] focus:ring-2 focus:ring-[#96613F]/15 transition-all"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#25211E] mb-1.5">
                    Organization Domain
                  </label>
                  <input
                    type="text"
                    value={orgData.domain}
                    onChange={(e) => setOrgData({ ...orgData, domain: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[10px] text-[#25211E] font-medium focus:bg-white focus:outline-none focus:border-[#96613F] focus:ring-2 focus:ring-[#96613F]/15 transition-all"
                  />
                </div>
              </div>

              {/* Upload Logo Section */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-[#25211E] mb-2">
                  Upload Organization Logo
                </label>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept=".svg,.png,.jpg,.jpeg,.webp"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <div className="p-4 rounded-[12px] bg-[#FAF7F2] border border-[#E8DCD1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[10px] bg-[#FFFFFF] border border-[#E8DCD1] flex items-center justify-center p-1.5 shrink-0 shadow-xs overflow-hidden">
                      {orgData.logoPreview ? (
                        <img
                          src={orgData.logoPreview}
                          alt="Organization logo"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="270 225 725 588"
                          className="w-full h-full"
                          aria-hidden="true"
                        >
                          <defs>
                            <linearGradient id={logoGradId} x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0" stopColor="#A8704D" />
                              <stop offset="0.54" stopColor="#96613F" />
                              <stop offset="1" stopColor="#805037" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M 799 651 L 798 650 L 798 647 L 797 646 L 797 644 L 794 640 L 792 636 L 792 634 L 790 632 L 788 628 L 788 626 L 785 623 L 785 621 L 783 619 L 781 615 L 781 613 L 778 609 L 778 607 L 777 605 L 773 600 L 772 597 L 767 592 L 766 592 L 764 590 L 762 590 L 760 588 L 742 588 L 741 587 L 739 588 L 685 588 L 684 589 L 681 589 L 680 590 L 675 591 L 669 594 L 667 596 L 664 597 L 653 607 L 653 608 L 650 611 L 650 612 L 645 618 L 640 629 L 636 634 L 636 636 L 633 642 L 631 644 L 626 655 L 622 660 L 622 662 L 620 664 L 620 666 L 618 668 L 617 670 L 617 672 L 615 674 L 614 677 L 615 678 L 775 678 L 776 677 L 781 677 L 782 676 L 784 676 L 786 674 L 788 674 L 793 670 L 794 667 L 796 665 L 796 663 L 798 659 L 798 652 Z M 975 708 L 974 707 L 974 703 L 973 702 L 973 699 L 972 698 L 971 693 L 964 679 L 962 677 L 960 672 L 958 670 L 957 667 L 955 665 L 953 660 L 951 658 L 944 644 L 942 642 L 937 632 L 935 630 L 934 627 L 932 625 L 926 613 L 924 611 L 923 608 L 921 606 L 919 601 L 917 599 L 916 596 L 914 594 L 908 582 L 906 580 L 905 577 L 903 575 L 902 572 L 900 570 L 897 563 L 895 561 L 893 556 L 891 554 L 889 549 L 887 547 L 885 542 L 883 540 L 881 535 L 879 533 L 877 528 L 875 526 L 873 521 L 871 519 L 869 514 L 867 512 L 865 507 L 863 505 L 857 493 L 855 491 L 854 488 L 852 486 L 845 472 L 843 470 L 842 467 L 840 465 L 839 462 L 837 460 L 835 455 L 833 453 L 827 441 L 825 439 L 824 436 L 822 434 L 820 429 L 818 427 L 816 422 L 814 420 L 812 415 L 810 413 L 808 408 L 806 406 L 804 401 L 802 399 L 800 394 L 798 392 L 798 391 L 796 389 L 794 385 L 787 377 L 787 376 L 776 365 L 775 365 L 770 360 L 769 360 L 761 354 L 758 353 L 756 351 L 748 347 L 746 347 L 743 345 L 741 345 L 740 344 L 738 344 L 734 342 L 731 342 L 730 341 L 727 341 L 726 340 L 721 340 L 720 339 L 710 339 L 709 338 L 704 338 L 703 339 L 692 339 L 691 340 L 686 340 L 685 341 L 678 342 L 677 343 L 672 344 L 669 346 L 667 346 L 653 353 L 651 355 L 650 355 L 648 357 L 644 359 L 640 363 L 639 363 L 623 379 L 623 380 L 617 387 L 617 388 L 609 399 L 608 402 L 606 404 L 605 407 L 603 409 L 602 412 L 600 414 L 599 417 L 597 419 L 596 422 L 594 424 L 593 427 L 591 429 L 589 434 L 587 436 L 586 439 L 584 441 L 583 444 L 581 446 L 578 453 L 576 455 L 575 458 L 573 460 L 571 465 L 569 467 L 567 472 L 565 474 L 563 479 L 561 481 L 558 488 L 556 490 L 554 495 L 552 497 L 546 509 L 544 511 L 541 518 L 539 520 L 537 525 L 535 527 L 532 534 L 530 536 L 527 543 L 525 545 L 522 552 L 520 554 L 516 563 L 514 565 L 511 572 L 509 574 L 505 583 L 503 585 L 501 590 L 499 592 L 494 603 L 492 605 L 474 641 L 474 643 L 463 665 L 461 667 L 458 674 L 456 676 L 454 680 L 449 685 L 449 686 L 440 693 L 438 694 L 436 694 L 435 695 L 433 695 L 432 696 L 423 697 L 422 696 L 417 696 L 416 695 L 414 695 L 413 694 L 411 694 L 409 693 L 407 691 L 406 691 L 400 685 L 400 684 L 398 682 L 395 676 L 395 674 L 394 673 L 394 669 L 393 668 L 393 662 L 394 661 L 394 656 L 395 655 L 396 650 L 403 636 L 405 634 L 412 619 L 414 617 L 425 594 L 427 592 L 442 562 L 444 560 L 447 553 L 449 551 L 457 535 L 459 533 L 466 519 L 468 517 L 470 512 L 472 510 L 474 505 L 476 503 L 482 491 L 484 489 L 485 486 L 487 484 L 489 479 L 491 477 L 493 472 L 495 470 L 501 458 L 503 456 L 504 453 L 506 451 L 507 448 L 509 446 L 509 444 L 512 438 L 512 435 L 513 434 L 513 430 L 514 429 L 514 413 L 513 412 L 512 405 L 510 402 L 510 400 L 509 398 L 507 396 L 505 392 L 496 383 L 490 380 L 488 378 L 486 378 L 485 377 L 483 377 L 479 375 L 475 375 L 474 374 L 459 374 L 458 375 L 454 375 L 453 376 L 451 376 L 450 377 L 445 378 L 439 381 L 437 383 L 436 383 L 434 385 L 430 387 L 420 397 L 420 398 L 415 404 L 412 411 L 410 413 L 409 416 L 407 418 L 404 425 L 402 427 L 395 441 L 393 443 L 392 446 L 390 448 L 387 455 L 385 457 L 383 462 L 381 464 L 378 471 L 376 473 L 369 487 L 367 489 L 365 494 L 363 496 L 360 503 L 358 505 L 356 510 L 354 512 L 345 530 L 343 532 L 336 546 L 334 548 L 327 562 L 325 564 L 322 571 L 320 573 L 306 601 L 306 603 L 300 615 L 299 620 L 297 623 L 297 625 L 296 626 L 296 628 L 295 629 L 295 631 L 294 632 L 294 634 L 292 638 L 292 641 L 291 642 L 291 645 L 290 646 L 290 651 L 289 652 L 289 679 L 290 680 L 290 685 L 291 686 L 291 690 L 292 691 L 292 694 L 293 695 L 293 697 L 294 698 L 294 700 L 295 701 L 296 706 L 298 709 L 298 711 L 303 721 L 305 723 L 307 728 L 309 730 L 311 734 L 314 737 L 314 738 L 317 741 L 317 742 L 325 750 L 325 751 L 328 754 L 329 754 L 336 761 L 337 761 L 344 767 L 350 770 L 352 772 L 355 773 L 357 775 L 365 779 L 367 779 L 374 783 L 376 783 L 382 786 L 384 786 L 385 787 L 388 787 L 392 789 L 395 789 L 396 790 L 400 790 L 401 791 L 405 791 L 406 792 L 413 792 L 414 793 L 441 793 L 442 792 L 448 792 L 449 791 L 453 791 L 454 790 L 461 789 L 462 788 L 464 788 L 465 787 L 467 787 L 468 786 L 473 785 L 491 776 L 493 774 L 494 774 L 496 772 L 500 770 L 503 767 L 504 767 L 508 763 L 509 763 L 523 749 L 523 748 L 527 744 L 527 743 L 533 736 L 533 735 L 535 733 L 535 732 L 543 721 L 544 718 L 546 716 L 565 678 L 567 676 L 579 651 L 581 649 L 608 594 L 610 592 L 615 581 L 617 579 L 629 555 L 631 553 L 635 544 L 637 542 L 649 518 L 651 516 L 654 509 L 656 507 L 659 500 L 661 498 L 667 486 L 669 484 L 670 481 L 672 479 L 679 465 L 681 463 L 683 459 L 689 453 L 692 452 L 694 450 L 696 450 L 700 448 L 709 448 L 710 449 L 715 450 L 717 452 L 718 452 L 725 459 L 725 460 L 727 462 L 735 478 L 737 480 L 741 489 L 743 491 L 748 502 L 750 504 L 754 513 L 756 515 L 761 526 L 763 528 L 769 541 L 771 543 L 776 554 L 778 556 L 785 571 L 787 573 L 794 588 L 796 590 L 805 609 L 807 611 L 818 634 L 820 636 L 826 649 L 828 651 L 834 664 L 836 666 L 845 685 L 847 687 L 856 706 L 858 708 L 864 721 L 866 723 L 869 730 L 871 732 L 876 743 L 881 749 L 881 750 L 889 758 L 890 758 L 896 763 L 904 767 L 906 767 L 909 769 L 912 769 L 913 770 L 917 770 L 918 771 L 932 771 L 933 770 L 937 770 L 938 769 L 940 769 L 943 767 L 945 767 L 951 764 L 953 762 L 954 762 L 965 751 L 965 750 L 967 748 L 972 738 L 972 736 L 973 735 L 973 732 L 974 731 L 974 728 L 975 727 Z M 521 245 L 508 245 L 507 246 L 502 246 L 501 247 L 498 247 L 492 250 L 490 250 L 484 253 L 479 257 L 478 257 L 467 268 L 467 269 L 464 272 L 463 275 L 461 277 L 460 279 L 460 281 L 458 284 L 457 289 L 456 290 L 456 293 L 455 294 L 455 298 L 454 299 L 454 313 L 455 314 L 455 318 L 456 319 L 456 322 L 459 328 L 459 330 L 461 334 L 463 336 L 464 339 L 472 348 L 473 348 L 480 354 L 488 358 L 490 358 L 494 360 L 497 360 L 498 361 L 505 361 L 506 362 L 512 362 L 513 361 L 520 361 L 521 360 L 524 360 L 525 359 L 528 359 L 531 357 L 533 357 L 541 353 L 543 351 L 544 351 L 548 347 L 549 347 L 557 339 L 557 338 L 560 335 L 560 334 L 562 332 L 562 331 L 564 329 L 566 325 L 566 323 L 568 320 L 569 313 L 570 312 L 570 305 L 571 304 L 571 299 L 570 298 L 570 291 L 569 290 L 569 287 L 568 286 L 568 283 L 567 282 L 567 280 L 563 272 L 561 270 L 561 269 L 558 266 L 558 265 L 551 258 L 550 258 L 544 253 L 536 249 L 534 249 L 533 248 L 531 248 L 527 246 L 522 246 Z"
                            fill={`url(#${logoGradId})`}
                            fillRule="evenodd"
                          />
                          <path
                            d="M 615 677 L 780 677 L 790 672 L 795 666 L 797 662 L 797 659 L 798 658 L 798 648 L 797 647 L 797 645 L 791 633 L 789 631 L 773 599 L 771 597 L 771 596 L 765 591 L 761 589 L 758 589 L 757 588 L 686 588 L 685 589 L 678 590 L 666 596 L 664 598 L 663 598 L 657 604 L 656 604 L 655 606 L 650 611 L 650 612 L 646 617 L 645 620 L 643 622 L 637 635 L 635 637 L 623 661 L 621 663 L 615 675 Z"
                            fill="#25211E"
                            fillRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#25211E]">
                        Current Brand Asset: <span className="font-semibold text-[#96613F]">{orgData.logoName}</span>
                      </p>
                      <p className="text-[11px] text-[#77716B]">
                        Recommended 512x512 PNG or SVG (max 2MB)
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-[8px] bg-white border border-[#E8DCD1] hover:border-[#96613F] text-xs font-semibold text-[#25211E] transition-all duration-150 active:scale-95 shadow-xs shrink-0 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-[#77716B]" />
                    <span>Upload New Logo</span>
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-[#F3E8DC] flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#96613F] hover:bg-[#4A3023] disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition-all duration-150 shadow-sm active:scale-95 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Organization Settings</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 2: AI & MODEL */}
          {activeTab === 'ai-model' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[14px] p-6 sm:p-8 shadow-sm space-y-8"
            >
              <div>
                <h3 className="text-base font-bold text-[#25211E] tracking-tight">AI & Model Configuration</h3>
                <p className="text-xs text-[#77716B] mt-1">
                  Configure LLM provider, temperature, and vector retrieval parameters.
                </p>
              </div>

              {/* Provider & Model Select */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                <div>
                  <label className="block font-semibold text-[#25211E] mb-1.5">AI Provider</label>
                  <select
                    value={aiData.provider}
                    onChange={(e) => setAiData({ ...aiData, provider: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[10px] text-[#25211E] font-medium focus:bg-white focus:outline-none focus:border-[#96613F] focus:ring-2 focus:ring-[#96613F]/15 transition-all cursor-pointer"
                  >
                    <option value="OpenAI Enterprise">OpenAI Enterprise</option>
                    <option value="Anthropic Enterprise">Anthropic Enterprise</option>
                    <option value="Azure OpenAI">Azure OpenAI Service</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#25211E] mb-1.5">Model Selection</label>
                  <select
                    value={aiData.model}
                    onChange={(e) => setAiData({ ...aiData, model: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[10px] text-[#25211E] font-medium focus:bg-white focus:outline-none focus:border-[#96613F] focus:ring-2 focus:ring-[#96613F]/15 transition-all cursor-pointer"
                  >
                    <option value="gpt-4o (128k Context)">gpt-4o (128k Context)</option>
                    <option value="gpt-4o-mini (128k Context)">gpt-4o-mini (128k Context)</option>
                    <option value="claude-3-5-sonnet">claude-3-5-sonnet (200k Context)</option>
                  </select>
                </div>
              </div>

              {/* Temperature Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-[#25211E]">
                    Model Temperature (Factual Grounding vs. Creativity)
                  </label>
                  <span className="font-bold text-[#96613F] bg-[#FAF7F2] px-2.5 py-0.5 rounded border border-[#E8DCD1]">
                    {aiData.temperature}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={aiData.temperature}
                  onChange={(e) => setAiData({ ...aiData, temperature: Number(e.target.value) })}
                  className="w-full accent-[#96613F] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#77716B]">
                  <span>0.0 (Deterministic & Strict Citations)</span>
                  <span>0.5 (Balanced)</span>
                  <span>1.0 (Creative & Generative)</span>
                </div>
              </div>

              {/* 3 Parameter Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="p-4 rounded-[12px] bg-[#FAF7F2] border border-[#E8DCD1] transition-all hover:border-[#96613F]/40">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#77716B]">
                    Top-K Retrieved Chunks
                  </p>
                  <select
                    value={aiData.topK}
                    onChange={(e) => setAiData({ ...aiData, topK: Number(e.target.value) })}
                    className="mt-2 w-full bg-white border border-[#E8DCD1] rounded-[8px] p-1.5 text-xs font-semibold text-[#25211E] focus:outline-none focus:border-[#96613F] cursor-pointer"
                  >
                    <option value={3}>Top 3 Chunks</option>
                    <option value={4}>Top 4 Chunks (Recommended)</option>
                    <option value={6}>Top 6 Chunks</option>
                    <option value={8}>Top 8 Chunks</option>
                  </select>
                </div>

                <div className="p-4 rounded-[12px] bg-[#FAF7F2] border border-[#E8DCD1] transition-all hover:border-[#96613F]/40">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#77716B]">
                    Chunk Size (Tokens)
                  </p>
                  <select
                    value={aiData.chunkSize}
                    onChange={(e) => setAiData({ ...aiData, chunkSize: Number(e.target.value) })}
                    className="mt-2 w-full bg-white border border-[#E8DCD1] rounded-[8px] p-1.5 text-xs font-semibold text-[#25211E] focus:outline-none focus:border-[#96613F] cursor-pointer"
                  >
                    <option value={500}>500 Tokens</option>
                    <option value={800}>800 Tokens (Default)</option>
                    <option value={1000}>1000 Tokens</option>
                  </select>
                </div>

                <div className="p-4 rounded-[12px] bg-[#FAF7F2] border border-[#E8DCD1] transition-all hover:border-[#96613F]/40">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#77716B]">
                    Embedding Model
                  </p>
                  <p className="text-xs font-bold text-[#25211E] mt-2">
                    text-embedding-3-large
                  </p>
                  <p className="text-[11px] text-[#77716B] mt-0.5">3,072 dimensions • Active</p>
                </div>
              </div>

              {/* Strict Source Citations Toggle */}
              <div className="p-4 rounded-[12px] bg-[#FAF7F2] border border-[#E8DCD1] flex items-center justify-between gap-4 transition-all hover:border-[#96613F]/40">
                <div>
                  <p className="text-xs font-bold text-[#25211E]">Enforce Strict Source Citations</p>
                  <p className="text-[11px] text-[#77716B] mt-0.5">
                    Prevent the AI assistant from answering questions when no matching document chunk exceeds 0.70 similarity.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={aiData.strictGrounding}
                  onChange={(e) => setAiData({ ...aiData, strictGrounding: e.target.checked })}
                  className="w-4 h-4 rounded accent-[#96613F] cursor-pointer shrink-0"
                />
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-[#F3E8DC] flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#96613F] hover:bg-[#4A3023] disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition-all duration-150 shadow-sm active:scale-95 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save AI Configuration</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 3: ACCESS & PERMISSIONS */}
          {activeTab === 'access' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[14px] p-6 sm:p-8 shadow-sm space-y-6"
            >
              <div>
                <h3 className="text-base font-bold text-[#25211E] tracking-tight">Access & Permissions</h3>
                <p className="text-xs text-[#77716B] mt-1">
                  Define default member capabilities and folder visibility policies.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* 1 */}
                <div className="p-4 rounded-[12px] bg-[#FAF7F2] border border-[#E8DCD1] flex items-center justify-between gap-4 transition-all hover:border-[#96613F]/40">
                  <div>
                    <p className="font-bold text-[#25211E]">Allow Members to View Cited Source Excerpts</p>
                    <p className="text-[11px] text-[#77716B] mt-0.5">
                      Users can open the Source Reference Card modal to verify page numbers and text excerpts.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.viewExcerpts}
                    onChange={(e) => setPermissions({ ...permissions, viewExcerpts: e.target.checked })}
                    className="w-4 h-4 rounded accent-[#96613F] cursor-pointer shrink-0"
                  />
                </div>

                {/* 2 */}
                <div className="p-4 rounded-[12px] bg-[#FAF7F2] border border-[#E8DCD1] flex items-center justify-between gap-4 transition-all hover:border-[#96613F]/40">
                  <div>
                    <p className="font-bold text-[#25211E]">Allow Original PDF / DOCX File Downloads</p>
                    <p className="text-[11px] text-[#77716B] mt-0.5">
                      Permit members to download original files from folders they are assigned to.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.allowDownloads}
                    onChange={(e) => setPermissions({ ...permissions, allowDownloads: e.target.checked })}
                    className="w-4 h-4 rounded accent-[#96613F] cursor-pointer shrink-0"
                  />
                </div>

                {/* 3 */}
                <div className="p-4 rounded-[12px] bg-[#FAF7F2] border border-[#E8DCD1] flex items-center justify-between gap-4 transition-all hover:border-[#96613F]/40">
                  <div>
                    <p className="font-bold text-[#25211E]">Auto-Assign "General" Folder to New Invitations</p>
                    <p className="text-[11px] text-[#77716B] mt-0.5">
                      Automatically grant new team members access to company-wide announcements and rules.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.autoAssignGeneral}
                    onChange={(e) => setPermissions({ ...permissions, autoAssignGeneral: e.target.checked })}
                    className="w-4 h-4 rounded accent-[#96613F] cursor-pointer shrink-0"
                  />
                </div>

                {/* 4 */}
                <div className="p-4 rounded-[12px] bg-[#FAF7F2] border border-[#E8DCD1] flex items-center justify-between gap-4 transition-all hover:border-[#96613F]/40">
                  <div>
                    <p className="font-bold text-[#25211E]">Enforce Multi-Factor Authentication (2FA) for Admins</p>
                    <p className="text-[11px] text-[#77716B] mt-0.5">
                      Require hardware key or authenticator app verification for all Admin role accounts.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={permissions.enforce2FA}
                    onChange={(e) => setPermissions({ ...permissions, enforce2FA: e.target.checked })}
                    className="w-4 h-4 rounded accent-[#96613F] cursor-pointer shrink-0"
                  />
                </div>

                {/* Default Folder Access */}
                <div className="pt-2">
                  <label className="block font-semibold text-[#25211E] mb-1.5">
                    Default Folder Access Policy for Newly Created Folders
                  </label>
                  <select
                    value={permissions.defaultFolderAccess}
                    onChange={(e) => setPermissions({ ...permissions, defaultFolderAccess: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[10px] text-[#25211E] font-medium focus:bg-white focus:outline-none focus:border-[#96613F] focus:ring-2 focus:ring-[#96613F]/15 transition-all cursor-pointer"
                  >
                    <option value="Restricted (Explicit Member Selection)">
                      Restricted (Explicit Member Selection)
                    </option>
                    <option value="All Organization Members">All Organization Members</option>
                  </select>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-[#F3E8DC] flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#96613F] hover:bg-[#4A3023] disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition-all duration-150 shadow-sm active:scale-95 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Permissions</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 4: INTEGRATIONS */}
          {activeTab === 'integrations' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[14px] p-6 sm:p-8 shadow-sm space-y-6"
            >
              <div>
                <h3 className="text-base font-bold text-[#25211E] tracking-tight">External Integrations</h3>
                <p className="text-xs text-[#77716B] mt-1">
                  Sync external cloud repositories and pipe AI retrieval tools to messaging tools.
                </p>
              </div>

              {/* 4 Integration Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {integrations.map((item) => {
                  const isConnected = item.status === 'Connected';
                  return (
                    <div
                      key={item.id}
                      className="p-5 rounded-[12px] bg-[#FAF7F2] border border-[#E8DCD1] flex flex-col justify-between hover:border-[#96613F]/50 hover:-translate-y-0.5 hover:shadow-2xs transition-all duration-150"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-sm text-[#25211E]">{item.name}</h4>
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                              isConnected
                                ? 'bg-[#EEF5F0] text-[#2B6141] border-[#CBE3D3]'
                                : 'bg-[#FFFFFF] text-[#77716B] border-[#E8DCD1]'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isConnected ? 'bg-[#2B6141]' : 'bg-[#77716B]'
                              }`}
                            />
                            {item.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#77716B] leading-relaxed mb-4">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex justify-end pt-3 border-t border-[#E8DCD1]">
                        <button
                          type="button"
                          onClick={() => handleIntegrationAction(item)}
                          className={`px-3.5 py-1.5 rounded-[8px] text-xs font-semibold border transition-all duration-150 active:scale-95 cursor-pointer ${item.actionStyle}`}
                          type="button"
                          disabled
                          className={`px-3.5 py-1.5 rounded-[8px] text-xs font-semibold border opacity-60 cursor-not-allowed ${item.actionStyle}`}
                        >
                          {item.actionText}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 5: GENERAL (ADMIN PROFILE & SECURITY) */}
          {activeTab === 'general' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[#FFFFFF] border border-[#E8DCD1] rounded-[14px] p-6 sm:p-8 shadow-sm space-y-8"
            >
              {/* Section 1: Admin Profile */}
              <div>
                <h3 className="text-base font-bold text-[#25211E] tracking-tight">Admin Profile & Security</h3>
                <p className="text-xs text-[#77716B] mt-1">
                  Update your administrator profile details, change password, or sign out.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 text-xs">
                  <div>
                    <label className="block font-semibold text-[#25211E] mb-1.5">Admin Full Name</label>
                    <input
                      type="text"
                      value={profileData.name || account?.user?.name || ''}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[10px] text-[#25211E] font-medium focus:bg-white focus:outline-none focus:border-[#96613F] focus:ring-2 focus:ring-[#96613F]/15 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#25211E] mb-1.5">Admin Email</label>
                    <input
                      type="email"
                      value={profileData.email || account?.user?.email || ''}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[10px] text-[#25211E] font-medium focus:bg-white focus:outline-none focus:border-[#96613F] focus:ring-2 focus:ring-[#96613F]/15 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#25211E] mb-1.5">Role Title</label>
                    <input
                      type="text"
                      disabled
                      value={profileData.role || (account?.role === 'admin' ? 'Workspace Admin' : account?.role || '')}
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2]/60 border border-[#E8DCD1] rounded-[10px] text-[#77716B] font-medium cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-[#96613F] hover:bg-[#4A3023] text-white text-xs font-semibold transition-all duration-150 active:scale-95 shadow-xs cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Update Profile</span>
                  </button>
                </div>
              </div>

              {/* Section 2: Change Password */}
              <div className="pt-6 border-t border-[#F3E8DC]">
                <h4 className="text-sm font-bold text-[#25211E] tracking-tight">Change Administrator Password</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
                  <div>
                    <label className="block font-semibold text-[#25211E] mb-1.5">Current Password</label>
                    <input
                      type="password"
                      value={profileData.currentPassword}
                      onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[10px] text-[#25211E] focus:bg-white focus:outline-none focus:border-[#96613F] focus:ring-2 focus:ring-[#96613F]/15 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#25211E] mb-1.5">New Password</label>
                    <input
                      type="password"
                      value={profileData.newPassword}
                      onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                      placeholder="Minimum 8 characters"
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E8DCD1] rounded-[10px] text-[#25211E] focus:bg-white focus:outline-none focus:border-[#96613F] focus:ring-2 focus:ring-[#96613F]/15 transition-all"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (!profileData.currentPassword || !profileData.newPassword) {
                        toast.error('Please enter both current and new passwords.');
                        return;
                      }
                      handleSave();
                    }}
                    className="px-4 py-2 rounded-[8px] bg-white hover:bg-[#FAF7F2] border border-[#E8DCD1] hover:border-[#96613F] text-xs font-semibold text-[#25211E] transition-all duration-150 active:scale-95 cursor-pointer"
                  >
                    Update Password
                  </button>
                </div>
              </div>

              {/* Section 3: End Session / Logout */}
              <div className="pt-6 border-t border-[#F3E8DC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-[#25211E] tracking-tight">End Administrator Session</h4>
                  <p className="text-xs text-[#77716B] mt-0.5">
                    Revoke current browser authentication and return to the login screen.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#FDF0EF] hover:bg-[#A83833] text-[#A83833] hover:text-white border border-[#F3C9C6] text-xs font-bold transition-all duration-150 active:scale-95 shadow-xs shrink-0 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout of Admin Panel</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}