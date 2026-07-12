/* ==========================================================
   EDUSPHERE ADMIN DASHBOARD - COMPLETE VANILLA JS
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       1. SIDEBAR TOGGLE + MOBILE OVERLAY
    ===================================================== */
    const sidebar = document.getElementById("sidebar");
    const menuToggle = document.getElementById("menuToggle");
    const closeSidebar = document.getElementById("closeSidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");

    function openSidebar() {
        sidebar.classList.add("active");
        sidebarOverlay.classList.add("active");
    }
    function closeSidebarFn() {
        sidebar.classList.remove("active");
        sidebarOverlay.classList.remove("active");
    }

    if (menuToggle) menuToggle.addEventListener("click", openSidebar);
    if (closeSidebar) closeSidebar.addEventListener("click", closeSidebarFn);
    if (sidebarOverlay) sidebarOverlay.addEventListener("click", closeSidebarFn);


    /* =====================================================
       2. FRONTEND ROUTING (Section Switching)
    ===================================================== */
    const navLinks = document.querySelectorAll("#nav-links a");
    const sections = document.querySelectorAll(".section-block");

    navLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            navLinks.forEach(n => n.classList.remove("active"));
            sections.forEach(s => s.classList.remove("active-section"));
            link.classList.add("active");
            const targetId = link.getAttribute("href").substring(1);
            const target = document.getElementById(targetId);
            if (target) target.classList.add("active-section");
            if (window.innerWidth <= 768) closeSidebarFn();
        });
    });


    /* =====================================================
       3. PROFILE DROPDOWN
    ===================================================== */
    const profileTrigger = document.getElementById("profileTrigger");
    const dropdownMenu = document.getElementById("dropdownMenu");

    if (profileTrigger) {
        profileTrigger.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle("active");
            // Close notification panel
            notifPanel?.classList.remove("active");
        });
    }

    document.addEventListener("click", (e) => {
        if (dropdownMenu && !profileTrigger.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove("active");
        }
    });


    /* =====================================================
       4. NOTIFICATION PANEL
    ===================================================== */
    const notifToggle = document.getElementById("notifToggle");
    const notifPanel = document.getElementById("notifPanel");
    const notifBadge = document.getElementById("notifBadge");
    const markAllRead = document.getElementById("markAllRead");

    if (notifToggle) {
        notifToggle.addEventListener("click", (e) => {
            e.stopPropagation();
            notifPanel.classList.toggle("active");
            dropdownMenu?.classList.remove("active");
        });
    }

    if (markAllRead) {
        markAllRead.addEventListener("click", () => {
            document.querySelectorAll(".notif-item.unread").forEach(item => {
                item.classList.remove("unread");
            });
            if (notifBadge) notifBadge.style.display = "none";
            showToast("All notifications marked as read.");
        });
    }

    document.addEventListener("click", (e) => {
        if (notifPanel && !notifToggle.contains(e.target)) {
            notifPanel.classList.remove("active");
        }
    });


    /* =====================================================
       5. DARK / LIGHT MODE TOGGLE
    ===================================================== */
    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");
    const quickDarkMode = document.getElementById("quickDarkMode");
    const settingsDarkMode = document.getElementById("settingsDarkMode");

    let isDark = true; // default dark

    function applyTheme(dark) {
        isDark = dark;
        document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
        if (themeIcon) {
            themeIcon.className = dark ? "fa-solid fa-moon" : "fa-solid fa-sun";
        }
        if (quickDarkMode) quickDarkMode.checked = dark;
        if (settingsDarkMode) settingsDarkMode.checked = dark;
        Chart.defaults.color = dark ? "#94a3b8" : "#64748b";
    }

    if (themeToggle) {
        themeToggle.addEventListener("click", () => applyTheme(!isDark));
    }
    if (quickDarkMode) {
        quickDarkMode.addEventListener("change", () => applyTheme(quickDarkMode.checked));
    }
    if (settingsDarkMode) {
        settingsDarkMode.addEventListener("change", () => applyTheme(settingsDarkMode.checked));
    }


    /* =====================================================
       6. COUNTER ANIMATION
    ===================================================== */
    const counters = document.querySelectorAll(".counter");
    counters.forEach(counter => {
        const target = +counter.getAttribute("data-target");
        const increment = target / 80;
        function updateCounter() {
            const current = +counter.innerText.replace(/,/g, '');
            if (current < target) {
                counter.innerText = Math.ceil(current + increment).toLocaleString();
                setTimeout(updateCounter, 16);
            } else {
                counter.innerText = target.toLocaleString();
            }
        }
        updateCounter();
    });


    /* =====================================================
       7. CHART.JS INITIALIZATION
    ===================================================== */
    if (typeof Chart !== 'undefined') {
        Chart.defaults.color = '#94a3b8';
        Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
        Chart.defaults.plugins.legend.labels.usePointStyle = true;

        // A. Student Growth Line Chart
        const growthCtx = document.getElementById('growthChart');
        if (growthCtx) {
            new Chart(growthCtx, {
                type: 'line',
                data: {
                    labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul'],
                    datasets: [{
                        label: 'New Admissions',
                        data: [120,190,300,250,400,600,850],
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59,130,246,0.08)',
                        borderWidth: 2.5,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#3b82f6',
                        pointRadius: 4
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { grid: { color: 'rgba(255,255,255,0.05)' } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }

        // B. Fee Collection Bar Chart
        const feeCtx = document.getElementById('feeChart');
        if (feeCtx) {
            new Chart(feeCtx, {
                type: 'bar',
                data: {
                    labels: ['Sem 1','Sem 2','Sem 3','Sem 4'],
                    datasets: [{
                        label: 'Collection (Lakhs)',
                        data: [45,60,35,80],
                        backgroundColor: ['#3b82f6','#8b5cf6','#10b981','#f59e0b'],
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { grid: { color: 'rgba(255,255,255,0.05)' } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }

        // C. Attendance Doughnut
        const attendanceCtx = document.getElementById('attendanceChart');
        if (attendanceCtx) {
            new Chart(attendanceCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Present','Absent','On Leave'],
                    datasets: [{
                        data: [85,10,5],
                        backgroundColor: ['#3b82f6','#ef4444','#f59e0b'],
                        borderWidth: 0, hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false, cutout: '72%',
                    plugins: { legend: { position: 'bottom' } }
                }
            });
        }

        // D. Teacher Distribution Pie
        const teacherCtx = document.getElementById('teacherChart');
        if (teacherCtx) {
            new Chart(teacherCtx, {
                type: 'pie',
                data: {
                    labels: ['Engineering','Management','Sciences','Arts'],
                    datasets: [{
                        data: [150,100,120,80],
                        backgroundColor: ['#8b5cf6','#3b82f6','#10b981','#f59e0b'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } }
                }
            });
        }

        // E. Reports - Fee Trend Line
        const reportFeeCtx = document.getElementById('reportFeeChart');
        if (reportFeeCtx) {
            new Chart(reportFeeCtx, {
                type: 'line',
                data: {
                    labels: ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'],
                    datasets: [{
                        label: 'Fee Collected (₹ Lakhs)',
                        data: [120,95,180,200,145,230,190,210,250,175,220,300],
                        borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.08)',
                        borderWidth: 2.5, fill: true, tension: 0.4
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { position: 'top' } },
                    scales: {
                        y: { grid: { color: 'rgba(255,255,255,0.05)' } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }

        // F. Reports - Sem Attendance Bar
        const reportAttCtx = document.getElementById('reportAttChart');
        if (reportAttCtx) {
            new Chart(reportAttCtx, {
                type: 'bar',
                data: {
                    labels: ['Sem 1','Sem 2','Sem 3','Sem 4','Sem 5','Sem 6','Sem 7','Sem 8'],
                    datasets: [{
                        label: 'Avg Attendance %',
                        data: [88,82,79,85,91,87,76,83],
                        backgroundColor: '#3b82f6', borderRadius: 8
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { min: 60, max: 100, grid: { color: 'rgba(255,255,255,0.05)' } },
                        x: { grid: { display: false } }
                    }
                }
            });
        }
    }


    /* =====================================================
       8. MODAL SYSTEM (Universal)
    ===================================================== */
    const modals = document.querySelectorAll(".modal-overlay");

    function openModal(id) {
        const m = document.getElementById(id);
        if (m) m.classList.add("active");
        dropdownMenu?.classList.remove("active");
    }

    function closeAllModals() {
        modals.forEach(m => m.classList.remove("active"));
    }

    // Open via data-modal triggers
    document.addEventListener("click", (e) => {
        const trigger = e.target.closest(".modal-trigger");
        if (trigger) {
            e.preventDefault();
            const modalId = trigger.getAttribute("data-modal");
            if (modalId) openModal(modalId);
        }
    });

    // Close via .close-modal button
    document.addEventListener("click", (e) => {
        if (e.target.closest(".close-modal")) {
            closeAllModals();
        }
    });

    // Close via outside click
    modals.forEach(modal => {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeAllModals();
        });
    });

    // ESC key closes modals
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeAllModals();
    });


    /* =====================================================
       9. PHOTO / IMAGE UPLOAD PREVIEW
    ===================================================== */

    // Student Photo Preview
    const studentPhotoInput = document.getElementById("studentPhotoInput");
    const studentPhotoPreview = document.getElementById("studentPhotoPreview");
    if (studentPhotoInput) {
        studentPhotoInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => { studentPhotoPreview.src = ev.target.result; };
                reader.readAsDataURL(file);
            }
        });
    }

    // Teacher Photo Preview
    const teacherPhotoInput = document.getElementById("teacherPhotoInput");
    const teacherPhotoPreview = document.getElementById("teacherPhotoPreview");
    if (teacherPhotoInput) {
        teacherPhotoInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => { teacherPhotoPreview.src = ev.target.result; };
                reader.readAsDataURL(file);
            }
        });
    }

    // Profile Photo Preview (navbar + modal)
    const profilePhotoInput = document.getElementById("profilePhotoInput");
    const profileModalImg = document.getElementById("profileModalImg");
    const navProfileImg = document.getElementById("navProfileImg");
    if (profilePhotoInput) {
        profilePhotoInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    if (profileModalImg) profileModalImg.src = ev.target.result;
                    if (navProfileImg) navProfileImg.src = ev.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }


    /* =====================================================
       10. ADD STUDENT FORM — Submit & Inject Row
    ===================================================== */
    let studentCounter = 8014;
    const addStudentForm = document.getElementById("addStudentForm");
    const studentTableBody = document.getElementById("studentTableBody");

    if (addStudentForm) {
        addStudentForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const name = document.getElementById("sName").value.trim();
            const father = document.getElementById("sFatherName").value.trim();
            const mobile = document.getElementById("sMobile").value.trim();
            const course = document.getElementById("sCourse").value;
            const sem = document.getElementById("sSem").value;
            const feeStatus = document.getElementById("sFeeStatus").value;
            const photoSrc = studentPhotoPreview?.src || "";

            if (!name || !father || !mobile || !course || !sem) {
                showToast("Please fill all required fields.", "error");
                return;
            }

            const statusClass = feeStatus === "Paid" ? "paid" : "pending";
            const admNo = `#STU${studentCounter++}`;

            const tr = document.createElement("tr");
            tr.setAttribute("data-name", name);
            tr.setAttribute("data-course", course);
            tr.setAttribute("data-fee", feeStatus);
            tr.innerHTML = `
                <td><img src="${photoSrc}" class="table-img" style="border-radius:50%;"></td>
                <td>${admNo}</td>
                <td>${name}</td>
                <td>${father}</td>
                <td>${course}</td>
                <td>${sem}</td>
                <td>${mobile}</td>
                <td><span class="status ${statusClass}">${feeStatus}</span></td>
                <td>
                    <div class="action-btns">
                        <button class="btn-icon view" title="View" data-action="view-student"><i class="fa-regular fa-eye"></i></button>
                        <button class="btn-icon edit" title="Edit" data-action="edit-student"><i class="fa-regular fa-pen-to-square"></i></button>
                        <button class="btn-icon delete" title="Delete" data-action="delete-row"><i class="fa-regular fa-trash-can"></i></button>
                    </div>
                </td>
            `;
            studentTableBody.prepend(tr);

            // Add activity
            addActivity(`<strong>${name}</strong> admitted to ${course}`, "bg-blue", "fa-user-plus");

            addStudentForm.reset();
            if (studentPhotoPreview) {
                studentPhotoPreview.src = "https://ui-avatars.com/api/?name=New+Student&background=3b82f6&color=fff";
            }
            closeAllModals();
            showToast(`Student "${name}" added successfully!`);
            // Navigate to students section
            navTo("students");
        });
    }


    /* =====================================================
       11. ADD TEACHER FORM — Submit & Inject Row
    ===================================================== */
    const addTeacherForm = document.getElementById("addTeacherForm");
    const teacherTableBody = document.getElementById("teacherTableBody");

    if (addTeacherForm) {
        addTeacherForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const name = document.getElementById("tName").value.trim();
            const qual = document.getElementById("tQual").value.trim();
            const dept = document.getElementById("tDept").value;
            const subject = document.getElementById("tSubject").value.trim();
            const mobile = document.getElementById("tmobile").value.trim();
            const status = document.getElementById("tStatus").value;
            const photoSrc = teacherPhotoPreview?.src || "";

            if (!name || !qual || !dept || !subject || !mobile) {
                showToast("Please fill all required fields.", "error");
                return;
            }

            const statusClass = status === "Active" ? "paid" : "pending";
            const tr = document.createElement("tr");
            tr.setAttribute("data-name", name);
            tr.setAttribute("data-dept", dept);
            tr.innerHTML = `
                <td><img src="${photoSrc}" class="table-img" style="border-radius:50%;"></td>
                <td>${name}</td>
                <td>${dept}</td>
                <td>${qual}</td>
                <td>${subject}</td>
                <td>${mobile}</td>
                <td><span class="status ${statusClass}">${status}</span></td>
                <td>
                    <div class="action-btns">
                        <button class="btn-icon view" title="View" data-action="view-teacher"><i class="fa-regular fa-eye"></i></button>
                        <button class="btn-icon edit" title="Edit" data-action="edit-teacher"><i class="fa-regular fa-pen-to-square"></i></button>
                        <button class="btn-icon delete" title="Delete" data-action="delete-row"><i class="fa-regular fa-trash-can"></i></button>
                    </div>
                </td>
            `;
            teacherTableBody.prepend(tr);

            addActivity(`<strong>${name}</strong> joined ${dept} Dept.`, "bg-purple", "fa-chalkboard-user");
            addTeacherForm.reset();
            if (teacherPhotoPreview) {
                teacherPhotoPreview.src = "https://ui-avatars.com/api/?name=New+Teacher&background=8b5cf6&color=fff";
            }
            closeAllModals();
            showToast(`Teacher "${name}" added successfully!`);
            navTo("teachers");
        });
    }


    /* =====================================================
       12. ADD COURSE FORM — Submit & Inject Card
    ===================================================== */
    const addCourseForm = document.getElementById("addCourseForm");
    const courseGrid = document.getElementById("courseGrid");

    if (addCourseForm) {
        addCourseForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("cName").value.trim();
            const code = document.getElementById("cCode").value.trim();
            const duration = document.getElementById("cDuration").value.trim() || "N/A";
            const sems = document.getElementById("cSems").value || "N/A";
            const hod = document.getElementById("cHod").value.trim() || "TBA";
            const room = document.getElementById("cRoom").value.trim() || "TBA";

            if (!name || !code) {
                showToast("Course Name and Code are required.", "error");
                return;
            }

            const card = document.createElement("div");
            card.className = "course-card glass-card";
            card.innerHTML = `
                <div class="course-header">
                    <span class="course-code">${code}</span>
                    <div class="course-action-menu">
                        <button class="course-menu-btn"><i class="fa-solid fa-ellipsis-vertical"></i></button>
                        <div class="course-dropdown">
                            <a href="#" data-action="edit-course">Edit Course</a>
                            <a href="#" data-action="delete-course" class="text-danger">Delete Course</a>
                        </div>
                    </div>
                </div>
                <h3>${name}</h3>
                <div class="course-details">
                    <p><i class="fa-regular fa-clock"></i> ${duration} (${sems} Semesters)</p>
                    <p><i class="fa-solid fa-users"></i> 0 Students</p>
                    <p><i class="fa-solid fa-chalkboard-user"></i> HOD: ${hod}</p>
                    <p><i class="fa-solid fa-door-open"></i> ${room}</p>
                </div>
                <div class="course-actions">
                    <button class="btn btn-outline-small modal-trigger" data-modal="assignTeacherModal">Assign Teacher</button>
                    <button class="btn btn-primary-small modal-trigger" data-modal="viewCourseModal">View Details</button>
                </div>
            `;
            courseGrid.prepend(card);
            addCourseForm.reset();
            closeAllModals();
            showToast(`Course "${name}" created successfully!`);
            navTo("courses");
        });
    }


    /* =====================================================
       13. TABLE ACTION BUTTONS (VIEW / EDIT / DELETE)
         Delegated to document since rows are dynamic
    ===================================================== */
    let rowToDelete = null;

    document.addEventListener("click", (e) => {
        const actionBtn = e.target.closest("[data-action]");
        if (!actionBtn) return;
        const action = actionBtn.getAttribute("data-action");
        const row = actionBtn.closest("tr");

        // --- VIEW STUDENT ---
        if (action === "view-student" && row) {
            const cells = row.querySelectorAll("td");
            const img = row.querySelector("img");
            document.getElementById("viewStudentPhoto").src = img ? img.src : "";
            document.getElementById("viewStudentAdm").textContent = cells[1]?.textContent || "";
            document.getElementById("viewStudentName").textContent = cells[2]?.textContent || "";
            document.getElementById("viewFatherName").textContent = cells[3]?.textContent || "";
            document.getElementById("viewCourse").textContent = cells[4]?.textContent || "";
            document.getElementById("viewSem").textContent = cells[5]?.textContent || "";
            document.getElementById("viewMobile").textContent = cells[6]?.textContent || "";
            document.getElementById("viewFeeStatus").textContent = row.getAttribute("data-fee") || cells[7]?.textContent?.trim() || "";
            document.getElementById("viewEmail").textContent = "-";
            document.getElementById("viewAddress").textContent = "-";
            openModal("viewStudentModal");
        }

        // --- EDIT STUDENT ---
        if (action === "edit-student" && row) {
            const cells = row.querySelectorAll("td");
            document.getElementById("editStudentRow").value = "";
            document.getElementById("editSName").value = cells[2]?.textContent?.trim() || "";
            document.getElementById("editSFatherName").value = cells[3]?.textContent?.trim() || "";
            document.getElementById("editSMobile").value = cells[6]?.textContent?.trim() || "";
            setSelectValue("editSCourse", cells[4]?.textContent?.trim() || "");
            setSelectValue("editSSem", cells[5]?.textContent?.trim() || "");
            setSelectValue("editSFeeStatus", row.getAttribute("data-fee") || "Paid");
            // Store reference to row for update
            actionBtn.closest("tr").setAttribute("data-edit-target", "true");
            openModal("editStudentModal");
        }

        // --- VIEW TEACHER ---
        if (action === "view-teacher" && row) {
            const cells = row.querySelectorAll("td");
            const img = row.querySelector("img");
            document.getElementById("viewTeacherPhoto").src = img ? img.src : "";
            document.getElementById("viewTeacherName").textContent = cells[1]?.textContent || "";
            document.getElementById("viewTeacherDept").textContent = cells[2]?.textContent || "";
            document.getElementById("viewTQual").textContent = cells[3]?.textContent || "";
            document.getElementById("viewTSubject").textContent = cells[4]?.textContent || "";
            document.getElementById("viewTmobile").textContent = cells[5]?.textContent || "";
            document.getElementById("viewTStatus").textContent = cells[6]?.textContent?.trim() || "";
            document.getElementById("viewTEmail").textContent = "-";
            openModal("viewTeacherModal");
        }

        // --- EDIT TEACHER ---
        if (action === "edit-teacher" && row) {
            const cells = row.querySelectorAll("td");
            document.getElementById("editTName").value = cells[1]?.textContent?.trim() || "";
            document.getElementById("editTQual").value = cells[3]?.textContent?.trim() || "";
            setSelectValue("editTDept", cells[2]?.textContent?.trim() || "");
            document.getElementById("editTSubject").value = cells[4]?.textContent?.trim() || "";
            document.getElementById("editTmobile").value = cells[5]?.textContent?.trim() || "";
            setSelectValue("editTStatus", "Active");
            row.setAttribute("data-edit-target", "true");
            openModal("editTeacherModal");
        }

        // --- DELETE ROW ---
        if (action === "delete-row" && row) {
            rowToDelete = row;
            openModal("deleteConfirmModal");
        }

        // --- DELETE COURSE ---
        if (action === "delete-course") {
            const card = actionBtn.closest(".course-card");
            rowToDelete = card;
            openModal("deleteConfirmModal");
        }
    });

    // Confirm Delete
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener("click", () => {
            if (rowToDelete) {
                rowToDelete.remove();
                rowToDelete = null;
                closeAllModals();
                showToast("Record deleted successfully.", "error");
            }
        });
    }

    // Edit Student Save
    const editStudentForm = document.getElementById("editStudentForm");
    if (editStudentForm) {
        editStudentForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const targetRow = document.querySelector("tr[data-edit-target='true']");
            if (targetRow) {
                const cells = targetRow.querySelectorAll("td");
                const name = document.getElementById("editSName").value.trim();
                const father = document.getElementById("editSFatherName").value.trim();
                const mobile = document.getElementById("editSMobile").value.trim();
                const course = document.getElementById("editSCourse").value;
                const sem = document.getElementById("editSSem").value;
                const feeStatus = document.getElementById("editSFeeStatus").value;
                const statusClass = feeStatus === "Paid" ? "paid" : "pending";

                if (cells[2]) cells[2].textContent = name;
                if (cells[3]) cells[3].textContent = father;
                if (cells[4]) cells[4].textContent = course;
                if (cells[5]) cells[5].textContent = sem;
                if (cells[6]) cells[6].textContent = mobile;
                if (cells[7]) cells[7].innerHTML = `<span class="status ${statusClass}">${feeStatus}</span>`;
                targetRow.setAttribute("data-name", name);
                targetRow.setAttribute("data-course", course);
                targetRow.setAttribute("data-fee", feeStatus);
                targetRow.removeAttribute("data-edit-target");
                closeAllModals();
                showToast(`Student "${name}" updated successfully!`);
            }
        });
    }

    // Edit Teacher Save
    const editTeacherForm = document.getElementById("editTeacherForm");
    if (editTeacherForm) {
        editTeacherForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const targetRow = document.querySelector("tr[data-edit-target='true']");
            if (targetRow) {
                const cells = targetRow.querySelectorAll("td");
                const name = document.getElementById("editTName").value.trim();
                const dept = document.getElementById("editTDept").value;
                const qual = document.getElementById("editTQual").value.trim();
                const subject = document.getElementById("editTSubject").value.trim();
                const mobile = document.getElementById("editTmobile").value.trim();
                const status = document.getElementById("editTStatus").value;
                const statusClass = status === "Active" ? "paid" : "pending";

                if (cells[1]) cells[1].textContent = name;
                if (cells[2]) cells[2].textContent = dept;
                if (cells[3]) cells[3].textContent = qual;
                if (cells[4]) cells[4].textContent = subject;
                if (cells[5]) cells[5].textContent = mobile;
                if (cells[6]) cells[6].innerHTML = `<span class="status ${statusClass}">${status}</span>`;
                targetRow.setAttribute("data-name", name);
                targetRow.setAttribute("data-dept", dept);
                targetRow.removeAttribute("data-edit-target");
                closeAllModals();
                showToast(`Teacher "${name}" updated successfully!`);
            }
        });
    }


    /* =====================================================
       14. SEARCH FILTERS
    ===================================================== */

    // Student Table Search + Filter
    const studentSearch = document.getElementById("studentSearch");
    const studentCourseFilter = document.getElementById("studentCourseFilter");
    const studentFeeFilter = document.getElementById("studentFeeFilter");

    function filterStudents() {
        const query = studentSearch?.value.toLowerCase() || "";
        const courseF = studentCourseFilter?.value || "";
        const feeF = studentFeeFilter?.value || "";
        document.querySelectorAll("#studentTableBody tr").forEach(row => {
            const name = row.getAttribute("data-name")?.toLowerCase() || "";
            const course = row.getAttribute("data-course") || "";
            const fee = row.getAttribute("data-fee") || "";
            const matchQuery = name.includes(query) || row.textContent.toLowerCase().includes(query);
            const matchCourse = !courseF || course === courseF;
            const matchFee = !feeF || fee === feeF;
            row.style.display = matchQuery && matchCourse && matchFee ? "" : "none";
        });
    }

    if (studentSearch) studentSearch.addEventListener("input", filterStudents);
    if (studentCourseFilter) studentCourseFilter.addEventListener("change", filterStudents);
    if (studentFeeFilter) studentFeeFilter.addEventListener("change", filterStudents);

    // Teacher Table Search + Filter
    const teacherSearch = document.getElementById("teacherSearch");
    const teacherDeptFilter = document.getElementById("teacherDeptFilter");

    function filterTeachers() {
        const query = teacherSearch?.value.toLowerCase() || "";
        const deptF = teacherDeptFilter?.value || "";
        document.querySelectorAll("#teacherTableBody tr").forEach(row => {
            const name = row.getAttribute("data-name")?.toLowerCase() || "";
            const dept = row.getAttribute("data-dept") || "";
            const matchQuery = name.includes(query) || row.textContent.toLowerCase().includes(query);
            const matchDept = !deptF || dept === deptF;
            row.style.display = matchQuery && matchDept ? "" : "none";
        });
    }

    if (teacherSearch) teacherSearch.addEventListener("input", filterTeachers);
    if (teacherDeptFilter) teacherDeptFilter.addEventListener("change", filterTeachers);

    // Fee Table Search + Filter
    const feeSearch = document.getElementById("feeSearch");
    const feeStatusFilter = document.getElementById("feeStatusFilter");

    function filterFees() {
        const query = feeSearch?.value.toLowerCase() || "";
        const statusF = feeStatusFilter?.value || "";
        document.querySelectorAll("#feeTableBody tr").forEach(row => {
            const status = row.getAttribute("data-status") || "";
            const matchQuery = row.textContent.toLowerCase().includes(query);
            const matchStatus = !statusF || status === statusF;
            row.style.display = matchQuery && matchStatus ? "" : "none";
        });
    }

    if (feeSearch) feeSearch.addEventListener("input", filterFees);
    if (feeStatusFilter) feeStatusFilter.addEventListener("change", filterFees);

    // Global Search (navigate to sections)
    const globalSearch = document.getElementById("globalSearch");
    if (globalSearch) {
        globalSearch.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                const q = globalSearch.value.toLowerCase().trim();
                if (q.includes("student")) { navTo("students"); globalSearch.value = ""; }
                else if (q.includes("teacher") || q.includes("faculty")) { navTo("teachers"); globalSearch.value = ""; }
                else if (q.includes("course") || q.includes("class")) { navTo("courses"); globalSearch.value = ""; }
                else if (q.includes("fee")) { navTo("fees"); globalSearch.value = ""; }
                else if (q.includes("attendance")) { navTo("attendance"); globalSearch.value = ""; }
                else if (q.includes("report")) { navTo("reports"); globalSearch.value = ""; }
                else if (q.includes("schedule")) { navTo("schedule"); globalSearch.value = ""; }
                else if (q.includes("admission")) { navTo("admissions"); globalSearch.value = ""; }
                else if (q.includes("setting")) { navTo("settings"); globalSearch.value = ""; }
            }
        });
    }

/* =====================================================
   15. PROFILE FORM SAVE
===================================================== */


    /* =====================================================
       16. CHANGE PASSWORD with Strength + Validation
    ===================================================== */
    const passwordForm = document.getElementById("passwordForm");
    const newPasswordInput = document.getElementById("newPassword");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const pwdMatchError = document.getElementById("pwdMatchError");
    const pwdStrength = document.getElementById("pwdStrength");
    const strengthFill = document.getElementById("strengthFill");
    const strengthLabel = document.getElementById("strengthLabel");

    if (newPasswordInput) {
        newPasswordInput.addEventListener("input", () => {
            const val = newPasswordInput.value;
            if (!val) { pwdStrength.style.display = "none"; return; }
            pwdStrength.style.display = "flex";
            const score = getPasswordStrength(val);
            const colors = ["#ef4444","#f59e0b","#3b82f6","#10b981"];
            const labels = ["Weak","Fair","Good","Strong"];
            const widths = ["25%","50%","75%","100%"];
            strengthFill.style.width = widths[score];
            strengthFill.style.background = colors[score];
            strengthLabel.textContent = labels[score];
            strengthLabel.style.color = colors[score];
        });
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener("input", () => {
            if (pwdMatchError) {
                pwdMatchError.style.display =
                    confirmPasswordInput.value && confirmPasswordInput.value !== newPasswordInput?.value
                        ? "block" : "none";
            }
        });
    }

    if (passwordForm) {
        passwordForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const current = document.getElementById("currentPassword").value;
            const newPwd = newPasswordInput?.value || "";
            const confirm = confirmPasswordInput?.value || "";

            if (!current) { showToast("Please enter your current password.", "error"); return; }
            if (newPwd.length < 8) { showToast("Password must be at least 8 characters.", "error"); return; }
            if (newPwd !== confirm) { showToast("Passwords do not match.", "error"); return; }

            passwordForm.reset();
            if (pwdStrength) pwdStrength.style.display = "none";
            if (pwdMatchError) pwdMatchError.style.display = "none";
            closeAllModals();
            showToast("Password updated successfully!");
        });
    }

    // Password Toggle Visibility
    document.querySelectorAll(".pwd-toggle").forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-target");
            const input = document.getElementById(targetId);
            if (input) {
                const isPassword = input.type === "password";
                input.type = isPassword ? "text" : "password";
                btn.innerHTML = isPassword
                    ? '<i class="fa-regular fa-eye-slash"></i>'
                    : '<i class="fa-regular fa-eye"></i>';
            }
        });
    });


    /* =====================================================
       17. FEE COLLECT — Live Summary
    ===================================================== */
    const totalFeeInput = document.getElementById("totalFeeInput");
    const amountPayingInput = document.getElementById("amountPayingInput");
    const feeSummaryBox = document.getElementById("feeSummaryBox");

    function updateFeeSummary() {
        const total = parseFloat(totalFeeInput?.value) || 0;
        const paying = parseFloat(amountPayingInput?.value) || 0;
        if (total > 0 || paying > 0) {
            if (feeSummaryBox) feeSummaryBox.style.display = "block";
            document.getElementById("summaryTotal").textContent = `₹${total.toLocaleString()}`;
            document.getElementById("summaryPaying").textContent = `₹${paying.toLocaleString()}`;
            document.getElementById("summaryBalance").textContent = `₹${Math.max(0, total - paying).toLocaleString()}`;
        }
    }

    if (totalFeeInput) totalFeeInput.addEventListener("input", updateFeeSummary);
    if (amountPayingInput) amountPayingInput.addEventListener("input", updateFeeSummary);

    const collectFeeForm = document.getElementById("collectFeeForm");
    if (collectFeeForm) {
        collectFeeForm.addEventListener("submit", (e) => {
            e.preventDefault();
            closeAllModals();
            showToast("Fee payment recorded successfully!");
            if (feeSummaryBox) feeSummaryBox.style.display = "none";
            collectFeeForm.reset();
        });
    }

    // Assign Teacher Form
    const assignTeacherForm = document.getElementById("assignTeacherForm");
    if (assignTeacherForm) {
        assignTeacherForm.addEventListener("submit", (e) => {
            e.preventDefault();
            closeAllModals();
            showToast("Teacher assigned successfully!");
            assignTeacherForm.reset();
        });
    }


    /* =====================================================
       18. FEE RECEIPT — Set Date + Print
    ===================================================== */
    const receiptDate = document.getElementById("receiptDate");
    if (receiptDate) {
        receiptDate.textContent = new Date().toLocaleDateString("en-IN", {
            day: "2-digit", month: "short", year: "numeric"
        });
    }

    const printReceiptBtn = document.getElementById("printReceiptBtn");
    if (printReceiptBtn) {
        printReceiptBtn.addEventListener("click", () => window.print());
    }


    /* =====================================================
       19. COURSE DROPDOWN (⋮ ellipsis menu)
    ===================================================== */
    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".course-menu-btn");
        if (btn) {
            e.stopPropagation();
            const dropdown = btn.nextElementSibling;
            // Close all others first
            document.querySelectorAll(".course-dropdown.active").forEach(d => {
                if (d !== dropdown) d.classList.remove("active");
            });
            dropdown?.classList.toggle("active");
            return;
        }
        // Close all on outside click
        document.querySelectorAll(".course-dropdown.active").forEach(d => d.classList.remove("active"));
    });


    /* =====================================================
       20. ATTENDANCE TOGGLE BUTTONS
    ===================================================== */
    document.addEventListener("click", (e) => {
        const attBtn = e.target.closest(".att-btn");
        if (attBtn) {
            const group = attBtn.closest(".attendance-toggle-group");
            group?.querySelectorAll(".att-btn").forEach(b => b.classList.remove("active"));
            attBtn.classList.add("active");
        }
    });

    // Save Attendance Button
    const saveAttendanceBtn = document.getElementById("saveAttendanceBtn");
    if (saveAttendanceBtn) {
        saveAttendanceBtn.addEventListener("click", () => {
            showToast("Attendance saved successfully!");
        });
    }

    // Set today's date in attendance date picker
    const attendanceDate = document.getElementById("attendanceDate");
    if (attendanceDate) {
        attendanceDate.value = new Date().toISOString().split("T")[0];
    }


    /* =====================================================
       21. REPORTS — Download Simulation
    ===================================================== */
    document.querySelectorAll(".report-download-card").forEach(card => {
        card.addEventListener("click", () => {
            const type = card.getAttribute("data-report");
            showToast(`${capitalize(type)} report download started...`);
        });
    });


    /* =====================================================
       22. SETTINGS PAGE SAVE
    ===================================================== */
    const saveSettingsBtn = document.getElementById("saveSettingsBtn");
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener("click", () => {
            showToast("Settings saved successfully!");
        });
    }


    /* =====================================================
       23. PAGINATION (UI interaction)
    ===================================================== */
    document.querySelectorAll(".pagination").forEach(pag => {
        pag.querySelectorAll(".page-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                pag.querySelectorAll(".page-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
            });
        });
    });


    /* =====================================================
       UTILITY FUNCTIONS
    ===================================================== */

    // Show Toast Notification
    function showToast(message, type = "success") {
        const toast = document.getElementById("toast");
        const toastMsg = document.getElementById("toastMsg");
        const toastIcon = toast?.querySelector(".toast-icon");
        if (!toast) return;
        if (toastMsg) toastMsg.textContent = message;
        if (toastIcon) {
            toastIcon.className = `toast-icon fa-solid ${type === "error"
                ? "fa-circle-exclamation" : "fa-circle-check"}`;
            toastIcon.style.color = type === "error" ? "var(--danger)" : "var(--success)";
        }
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 3500);
    }

    // Navigate to a section
    function navTo(sectionId) {
        sections.forEach(s => s.classList.remove("active-section"));
        navLinks.forEach(n => n.classList.remove("active"));
        const target = document.getElementById(sectionId);
        if (target) target.classList.add("active-section");
        const link = document.querySelector(`#nav-links a[href="#${sectionId}"]`);
        if (link) link.classList.add("active");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Add Recent Activity
    function addActivity(text, iconClass, iconName) {
        const list = document.getElementById("activityList");
        if (!list) return;
        const div = document.createElement("div");
        div.className = "activity-item";
        div.innerHTML = `
            <div class="activity-icon ${iconClass}"><i class="fa-solid ${iconName}"></i></div>
            <div class="activity-text">
                <p>${text}</p>
                <span>Just now</span>
            </div>
        `;
        list.prepend(div);
    }

    // Set select value by text
    function setSelectValue(selectId, value) {
        const sel = document.getElementById(selectId);
        if (!sel) return;
        for (let opt of sel.options) {
            if (opt.text === value || opt.value === value) {
                sel.value = opt.value;
                break;
            }
        }
    }

    // Password Strength Score (0-3)
    function getPasswordStrength(pwd) {
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        return Math.min(score - 1, 3);
    }

    // Capitalize string
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

}); // END DOMContentLoaded