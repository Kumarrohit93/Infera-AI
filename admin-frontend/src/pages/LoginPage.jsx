import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  FileText,
  ShieldCheck,
  MessageSquare,
  BarChart3,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  X,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSsoLoading, setIsSsoLoading] = useState(false);

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Strict Admin Login validation
  const handleLogin = (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      toast.error('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      if (trimmedEmail === 'admin@infera.ai' && trimmedPassword === 'admin123') {
        localStorage.setItem('isAdminAuth', 'true');
        toast.success('Admin login successful!');
        navigate('/dashboard');
      } else {
        toast.error('Invalid credentials. Only authorized administrators can sign in.');
      }
    }, 700);
  };

  // Google Workspace SSO handler
  const handleGoogleSSO = () => {
    setIsSsoLoading(true);
    toast.loading('Connecting to Google Workspace SSO...', { id: 'sso-toast' });
    setTimeout(() => {
      setIsSsoLoading(false);
      toast.dismiss('sso-toast');
      localStorage.setItem('isAdminAuth', 'true');
      toast.success('SSO authentication verified!');
      navigate('/dashboard');
    }, 1200);
  };

  // Forgot password submit
  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Please enter your work email address.');
      return;
    }
    setResetSent(true);
    toast.success('Password reset link has been dispatched.');
  };

  // 4 Feature highlight cards data
  const featureCards = [
    {
      id: 1,
      title: '1. Manage Documents',
      description: 'Upload PDF, DOCX, and TXT files with automated chunking and vector indexing.',
      icon: <FileText className="w-5 h-5 text-[#96613F]" />
    },
    {
      id: 2,
      title: '2. Control Team Access',
      description: 'Configure granular folder-level permissions across HR, IT, Finance, and Operations.',
      icon: <ShieldCheck className="w-5 h-5 text-[#96613F]" />
    },
    {
      id: 3,
      title: '3. AI Assistant',
      description: 'Ask natural-language questions and get instant answers with exact page citations.',
      icon: <MessageSquare className="w-5 h-5 text-[#96613F]" />
    },
    {
      id: 4,
      title: '4. Insights & Feedback',
      description: 'Audit answer quality, review user ratings, and verify cited source excerpts.',
      icon: <BarChart3 className="w-5 h-5 text-[#96613F]" />
    }
  ];

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FAF7F2] text-[#25211E] overflow-x-hidden selection:bg-[#F3E8DC] selection:text-[#4A3023]">
      
      {/* ================= LEFT SHOWCASE PANEL (HIDDEN ON MOBILE, VISIBLE ON DESKTOP) ================= */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden lg:flex lg:w-3/5 p-10 lg:p-14 xl:p-20 flex-col justify-between bg-[#F3E8DC]/40 border-r border-[#E8DCD1]"
      >
        <div>
          {/* Top Branding */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-[#FFFFFF] border border-[#E8DCD1] flex items-center justify-center p-1.5 shadow-sm transition-transform hover:scale-105 duration-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="270 225 725 588"
                className="w-full h-full"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="inferaWarmLogin" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#A8704D" />
                    <stop offset="0.54" stopColor="#96613F" />
                    <stop offset="1" stopColor="#805037" />
                  </linearGradient>
                </defs>
                <path
                  d="M 799 651 L 798 650 L 798 647 L 797 646 L 797 644 L 794 640 L 792 636 L 792 634 L 790 632 L 788 628 L 788 626 L 785 623 L 785 621 L 783 619 L 781 615 L 781 613 L 778 609 L 778 607 L 777 605 L 773 600 L 772 597 L 767 592 L 766 592 L 764 590 L 762 590 L 760 588 L 742 588 L 741 587 L 739 588 L 685 588 L 684 589 L 681 589 L 680 590 L 675 591 L 669 594 L 667 596 L 664 597 L 653 607 L 653 608 L 650 611 L 650 612 L 645 618 L 640 629 L 636 634 L 636 636 L 633 642 L 631 644 L 626 655 L 622 660 L 622 662 L 620 664 L 620 666 L 618 668 L 617 670 L 617 672 L 615 674 L 614 677 L 615 678 L 775 678 L 776 677 L 781 677 L 782 676 L 784 676 L 786 674 L 788 674 L 793 670 L 794 667 L 796 665 L 796 663 L 798 659 L 798 652 Z M 975 708 L 974 707 L 974 703 L 973 702 L 973 699 L 972 698 L 971 693 L 964 679 L 962 677 L 960 672 L 958 670 L 957 667 L 955 665 L 953 660 L 951 658 L 944 644 L 942 642 L 937 632 L 935 630 L 934 627 L 932 625 L 926 613 L 924 611 L 923 608 L 921 606 L 919 601 L 917 599 L 916 596 L 914 594 L 908 582 L 906 580 L 905 577 L 903 575 L 902 572 L 900 570 L 897 563 L 895 561 L 893 556 L 891 554 L 889 549 L 887 547 L 885 542 L 883 540 L 881 535 L 879 533 L 877 528 L 875 526 L 873 521 L 871 519 L 869 514 L 867 512 L 865 507 L 863 505 L 857 493 L 855 491 L 854 488 L 852 486 L 845 472 L 843 470 L 842 467 L 840 465 L 839 462 L 837 460 L 835 455 L 833 453 L 827 441 L 825 439 L 824 436 L 822 434 L 820 429 L 818 427 L 816 422 L 814 420 L 812 415 L 810 413 L 808 408 L 806 406 L 804 401 L 802 399 L 800 394 L 798 392 L 798 391 L 796 389 L 794 385 L 787 377 L 787 376 L 776 365 L 775 365 L 770 360 L 769 360 L 761 354 L 758 353 L 756 351 L 748 347 L 746 347 L 743 345 L 741 345 L 740 344 L 738 344 L 734 342 L 731 342 L 730 341 L 727 341 L 726 340 L 721 340 L 720 339 L 710 339 L 709 338 L 704 338 L 703 339 L 692 339 L 691 340 L 686 340 L 685 341 L 678 342 L 677 343 L 672 344 L 669 346 L 667 346 L 653 353 L 651 355 L 650 355 L 648 357 L 644 359 L 640 363 L 639 363 L 623 379 L 623 380 L 617 387 L 617 388 L 609 399 L 608 402 L 606 404 L 605 407 L 603 409 L 602 412 L 600 414 L 599 417 L 597 419 L 596 422 L 594 424 L 593 427 L 591 429 L 589 434 L 587 436 L 586 439 L 584 441 L 583 444 L 581 446 L 578 453 L 576 455 L 575 458 L 573 460 L 571 465 L 569 467 L 567 472 L 565 474 L 563 479 L 561 481 L 558 488 L 556 490 L 554 495 L 552 497 L 546 509 L 544 511 L 541 518 L 539 520 L 537 525 L 535 527 L 532 534 L 530 536 L 527 543 L 525 545 L 522 552 L 520 554 L 516 563 L 514 565 L 511 572 L 509 574 L 505 583 L 503 585 L 501 590 L 499 592 L 494 603 L 492 605 L 474 641 L 474 643 L 463 665 L 461 667 L 458 674 L 456 676 L 454 680 L 449 685 L 449 686 L 440 693 L 438 694 L 436 694 L 435 695 L 433 695 L 432 696 L 423 697 L 422 696 L 417 696 L 416 695 L 414 695 L 413 694 L 411 694 L 409 693 L 407 691 L 406 691 L 400 685 L 400 684 L 398 682 L 395 676 L 395 674 L 394 673 L 394 669 L 393 668 L 393 662 L 394 661 L 394 656 L 395 655 L 396 650 L 403 636 L 405 634 L 412 619 L 414 617 L 425 594 L 427 592 L 442 562 L 444 560 L 447 553 L 449 551 L 457 535 L 459 533 L 466 519 L 468 517 L 470 512 L 472 510 L 474 505 L 476 503 L 482 491 L 484 489 L 485 486 L 487 484 L 489 479 L 491 477 L 493 472 L 495 470 L 501 458 L 503 456 L 504 453 L 506 451 L 507 448 L 509 446 L 509 444 L 512 438 L 512 435 L 513 434 L 513 430 L 514 429 L 514 413 L 513 412 L 512 405 L 510 402 L 510 400 L 509 398 L 507 396 L 505 392 L 496 383 L 490 380 L 488 378 L 486 378 L 485 377 L 483 377 L 479 375 L 475 375 L 474 374 L 459 374 L 458 375 L 454 375 L 453 376 L 451 376 L 450 377 L 445 378 L 439 381 L 437 383 L 436 383 L 434 385 L 430 387 L 420 397 L 420 398 L 415 404 L 412 411 L 410 413 L 409 416 L 407 418 L 404 425 L 402 427 L 395 441 L 393 443 L 392 446 L 390 448 L 387 455 L 385 457 L 383 462 L 381 464 L 378 471 L 376 473 L 369 487 L 367 489 L 365 494 L 363 496 L 360 503 L 358 505 L 356 510 L 354 512 L 345 530 L 343 532 L 336 546 L 334 548 L 327 562 L 325 564 L 322 571 L 320 573 L 306 601 L 306 603 L 300 615 L 299 620 L 297 623 L 297 625 L 296 626 L 296 628 L 295 629 L 295 631 L 294 632 L 294 634 L 292 638 L 292 641 L 291 642 L 291 645 L 290 646 L 290 651 L 289 652 L 289 679 L 290 680 L 290 685 L 291 686 L 291 690 L 292 691 L 292 694 L 293 695 L 293 697 L 294 698 L 294 700 L 295 701 L 296 706 L 298 709 L 298 711 L 303 721 L 305 723 L 307 728 L 309 730 L 311 734 L 314 737 L 314 738 L 317 741 L 317 742 L 325 750 L 325 751 L 328 754 L 329 754 L 336 761 L 337 761 L 344 767 L 350 770 L 352 772 L 355 773 L 357 775 L 365 779 L 367 779 L 374 783 L 376 783 L 382 786 L 384 786 L 385 787 L 388 787 L 392 789 L 395 789 L 396 790 L 400 790 L 401 791 L 405 791 L 406 792 L 413 792 L 414 793 L 441 793 L 442 792 L 448 792 L 449 791 L 453 791 L 454 790 L 461 789 L 462 788 L 464 788 L 465 787 L 467 787 L 468 786 L 473 785 L 491 776 L 493 774 L 494 774 L 496 772 L 500 770 L 503 767 L 504 767 L 508 763 L 509 763 L 523 749 L 523 748 L 527 744 L 527 743 L 533 736 L 533 735 L 535 733 L 535 732 L 543 721 L 544 718 L 546 716 L 565 678 L 567 676 L 579 651 L 581 649 L 608 594 L 610 592 L 615 581 L 617 579 L 629 555 L 631 553 L 635 544 L 637 542 L 649 518 L 651 516 L 654 509 L 656 507 L 659 500 L 661 498 L 667 486 L 669 484 L 670 481 L 672 479 L 679 465 L 681 463 L 683 459 L 689 453 L 692 452 L 694 450 L 696 450 L 700 448 L 709 448 L 710 449 L 715 450 L 717 452 L 718 452 L 725 459 L 725 460 L 727 462 L 735 478 L 737 480 L 741 489 L 743 491 L 748 502 L 750 504 L 754 513 L 756 515 L 761 526 L 763 528 L 769 541 L 771 543 L 776 554 L 778 556 L 785 571 L 787 573 L 794 588 L 796 590 L 805 609 L 807 611 L 818 634 L 820 636 L 826 649 L 828 651 L 834 664 L 836 666 L 845 685 L 847 687 L 856 706 L 858 708 L 864 721 L 866 723 L 869 730 L 871 732 L 876 743 L 881 749 L 881 750 L 889 758 L 890 758 L 896 763 L 904 767 L 906 767 L 909 769 L 912 769 L 913 770 L 917 770 L 918 771 L 932 771 L 933 770 L 937 770 L 938 769 L 940 769 L 943 767 L 945 767 L 951 764 L 953 762 L 954 762 L 965 751 L 965 750 L 967 748 L 972 738 L 972 736 L 973 735 L 973 732 L 974 731 L 974 728 L 975 727 Z M 521 245 L 508 245 L 507 246 L 502 246 L 501 247 L 498 247 L 492 250 L 490 250 L 484 253 L 479 257 L 478 257 L 467 268 L 467 269 L 464 272 L 463 275 L 461 277 L 460 279 L 460 281 L 458 284 L 457 289 L 456 290 L 456 293 L 455 294 L 455 298 L 454 299 L 454 313 L 455 314 L 455 318 L 456 319 L 456 322 L 459 328 L 459 330 L 461 334 L 463 336 L 464 339 L 472 348 L 473 348 L 480 354 L 488 358 L 490 358 L 494 360 L 497 360 L 498 361 L 505 361 L 506 362 L 512 362 L 513 361 L 520 361 L 521 360 L 524 360 L 525 359 L 528 359 L 531 357 L 533 357 L 541 353 L 543 351 L 544 351 L 548 347 L 549 347 L 557 339 L 557 338 L 560 335 L 560 334 L 562 332 L 562 331 L 564 329 L 566 325 L 566 323 L 568 320 L 569 313 L 570 312 L 570 305 L 571 304 L 571 299 L 570 298 L 570 291 L 569 290 L 569 287 L 568 286 L 568 283 L 567 282 L 567 280 L 563 272 L 561 270 L 561 269 L 558 266 L 558 265 L 551 258 L 550 258 L 544 253 L 536 249 L 534 249 L 533 248 L 531 248 L 527 246 L 522 246 Z"
                  fill="url(#inferaWarmLogin)"
                  fillRule="evenodd"
                />
                <path
                  d="M 615 677 L 780 677 L 790 672 L 795 666 L 797 662 L 797 659 L 798 658 L 798 648 L 797 647 L 797 645 L 791 633 L 789 631 L 773 599 L 771 597 L 771 596 L 765 591 L 761 589 L 758 589 L 757 588 L 686 588 L 685 589 L 678 590 L 666 596 L 664 598 L 663 598 L 657 604 L 656 604 L 655 606 L 650 611 L 650 612 L 646 617 L 645 620 L 643 622 L 637 635 L 635 637 L 623 661 L 621 663 L 615 675 Z"
                  fill="#25211E"
                  fillRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-[#4A3023]">Infera AI</span>
              <span className="text-[10px] font-semibold tracking-wide bg-[#F3E8DC] text-[#4A3023] px-2 py-0.5 rounded border border-[#E8DCD1]">
                ENTERPRISE
              </span>
            </div>
          </div>

          {/* Headline & Subtitle */}
          <div className="max-w-xl">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8DCD1] text-xs font-medium text-[#4A3023] mb-5 shadow-xs"
            >
              <CheckCircle className="w-3.5 h-3.5 text-[#96613F]" />
              <span>Grounded Document Intelligence</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-[#25211E] leading-tight mb-4"
            >
              AI Knowledge Base for Your Organization
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-sm text-[#77716B] leading-relaxed mb-8"
            >
              Centralize internal policies, handbooks, and SOPs into a secure knowledge base. Empower teams to ask questions and receive verifiable answers with page-level source citations.
            </motion.p>

            {/* 4 Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featureCards.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 + index * 0.1, duration: 0.4 }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="bg-white border border-[#E8DCD1] rounded-2xl p-4 shadow-xs hover:border-[#96613F]/40 hover:shadow-md transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#E8DCD1] flex items-center justify-center">
                      {card.icon}
                    </div>
                    <h3 className="font-semibold text-sm text-[#25211E]">
                      {card.title}
                    </h3>
                  </div>
                  <p className="text-xs text-[#77716B] leading-relaxed pl-1">
                    {card.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Compliance Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-12 pt-6 border-t border-[#E8DCD1] flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#77716B] gap-2"
        >
          <span>SOC2 Type II Certified • ISO 27001 Compliant</span>
          <span>Strict Source Grounding Engine v2.4</span>
        </motion.div>
      </motion.div>

      {/* ================= RIGHT AUTHENTICATION CARD (ONLY THIS CARD ON MOBILE) ================= */}
      <div className="w-full lg:w-2/5 min-h-screen p-4 sm:p-8 lg:p-12 flex items-center justify-center bg-[#FAF7F2]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-[420px] bg-white border border-[#E8DCD1] rounded-[24px] sm:rounded-3xl p-6 sm:p-8 lg:p-9 shadow-sm"
        >
          
          {/* Form Header */}
          <div className="mb-6">
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#96613F]">
              Workspace Administration
            </span>
            <h2 className="text-2xl font-bold text-[#25211E] mt-1 tracking-tight">Admin Login</h2>
            <p className="text-xs text-[#77716B] mt-1.5 leading-relaxed">
              Sign in with your administrator credentials to manage documents, permissions, and AI retrieval settings.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Work Email */}
            <div>
              <label className="block text-xs font-semibold text-[#25211E] mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#77716B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@infera.ai"
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E8DCD1] bg-[#FAF7F2]/40 focus:bg-white focus:outline-none focus:border-[#96613F] transition-all text-[#25211E]"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#25211E]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-xs text-[#96613F] hover:underline font-medium transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 text-[#77716B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs pl-10 pr-10 py-2.5 rounded-xl border border-[#E8DCD1] bg-[#FAF7F2]/40 focus:bg-white focus:outline-none focus:border-[#96613F] transition-all text-[#25211E]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#77716B] hover:text-[#25211E] transition-colors p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Keep me signed in */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-[#E8DCD1] accent-[#96613F] cursor-pointer"
                />
                <span className="text-xs text-[#77716B]">Keep me signed in for 30 days</span>
              </label>
            </div>

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-[#96613F] hover:bg-[#4A3023] disabled:opacity-70 text-white text-xs font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Login as Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* SSO Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="border-t border-[#E8DCD1] w-full"></div>
            <span className="bg-white px-3 text-[11px] text-[#77716B] absolute select-none">
              Or continue with enterprise SSO
            </span>
          </div>

          {/* Google SSO Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            disabled={isSsoLoading}
            onClick={handleGoogleSSO}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#E8DCD1] bg-white hover:bg-[#FAF7F2] transition-colors text-xs font-semibold text-[#25211E] cursor-pointer"
          >
            {isSsoLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#96613F]" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google Workspace</span>
              </>
            )}
          </motion.button>
        </motion.div>
      </div>

      {/* ================= FORGOT PASSWORD MODAL ================= */}
      <AnimatePresence>
        {isForgotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsForgotModalOpen(false);
                setResetSent(false);
                setResetEmail('');
              }}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm bg-white rounded-2xl border border-[#E8DCD1] p-6 shadow-xl relative z-10"
            >
              <button
                onClick={() => {
                  setIsForgotModalOpen(false);
                  setResetSent(false);
                  setResetEmail('');
                }}
                className="absolute right-4 top-4 text-[#77716B] hover:text-[#25211E] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {!resetSent ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-[#25211E]">Reset Password</h3>
                    <p className="text-xs text-[#77716B] mt-1">
                      Enter your registered work email to receive password reset instructions.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#25211E] mb-1.5">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="admin@infera.ai"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8DCD1] bg-[#FAF7F2]/40 focus:bg-white focus:outline-none focus:border-[#96613F]"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotModalOpen(false)}
                      className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#77716B] hover:bg-[#FAF7F2] transition-colors"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-medium bg-[#96613F] hover:bg-[#4A3023] text-white transition-colors"
                    >
                      Send Reset Link
                    </motion.button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-4 space-y-3">
                  <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h3 className="text-sm font-bold text-[#25211E]">Link Dispatched</h3>
                  <p className="text-xs text-[#77716B]">
                    Reset instructions have been sent to: <br />
                    <span className="font-semibold text-[#25211E]">{resetEmail}</span>
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => {
                      setIsForgotModalOpen(false);
                      setResetSent(false);
                    }}
                    className="mt-2 w-full py-2 rounded-xl text-xs font-medium bg-[#96613F] text-white"
                  >
                    Back to Sign In
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}