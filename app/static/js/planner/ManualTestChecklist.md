# Functionality CheckList


# Start Up
- [x] Planner Generates without error.
- [x] All units visible.
- [x] Status bar is visible.
- [x] Option bar visible if applicable.
- [x] If there is an error in generation caused by infinite loop, an alert should appear informing the user of the error.
- [x] The option bar shouldn't appear, if a major has no option units.
- [x] If the major has no option units, the status bar should display 'Done'.
- [x] If the major has option units, the status bar should display 'Add Option Units'.
- [x] Table should generate a legal study plan (all units placed correctly such that their requirements are met).
- [x] If the major doesn't have NS units, then the NS rows in the planner shouldn't appear.
- [x] Likewise it a major does have NS units, then the NS rows ought to appear.
- [x] The major has the right amount of broadening units in the planner (e.g. chem vs software majors).
- [x] The amount of broadening units decreases with each bridging unit the user takes.


# Drag and Drop
- [x] You can drag any unit and drop it in a teaching period the unit is offered in.
- [x] You are prevented from dropping a unit into a teaching period it is not offered in.
- [x] If you attempt to drop a unit into an incorrect teaching period the relevant error message is displayed on the info bar.
- [x] If you drag a unit over another unit it swaps the unit, provided the swap is legal (units are offered in the respective semesters).
- [x] If swap is illegal it is prevented and the relevant error message is displayed on the info bar.
- [x] Attempting to add a core unit to the option bar is prevented and the relevant error message is displayed on the info bar.
- [x] Attempting to swap a core unit with an option unit in the option bar is prevented and the relevant error message is displayed on the info bar.
- [x] Dragging a unit below the table ('drop a unit here to add a row!') creates a new row, with the unit placed in the correct semester.
- [x] If a year in the planner has no following years and has only one unit left and this unit is dragged and dropped into an earlier year, The empty year should disapear from the planner.


# Display invalid enrollments
- [x] If a unit prerequisite isn't met the unit is highlighted in red, and the info bar displays what prerequisite wasn't met.
- [x] If a unit corequisite isn't met the unit is highlighted in red, and the info bar displays what corequisite wasn't met.
- [x] If the user clicks elsewhere the info bar is cleared, but the unit is still highlighted.
- [x] If the user clicks back on the unit, all of it's requirements that haven't been met for that unit will be displayed on the infoBar.
- [x] If dragging and dropping or swapping a unit results in unit requirements not being met, all unmet requirements should be shown on the infoBar and all the units who's requirements aren't met should be highlighted in red.
- [x] If a unit's requirements are met, then the red highlighting should clear, the info bar should update accordingly and clicking on the unit should now display its unit information.
- [x] Placing a prerequisite in the same period or greater will result in an error.
- [x] Placing a corequisite in a greater period will result in an error.
- [x] Placing a corequisite in the same period or earlier won't result in an error.
- [x] Placing an 'or' prerequisite in the same period or greater will result in an error provided all or units are placed in the same period or greater.
- [x] Placing an 'or' prerequisite in the same period or greater won't result in an error if there is an 'or' prerequisite in an earlier period then the target unit.
- [x] If an NS unit has a requirement that's in a standard teaching period, and the requirement is placed in a later period, then an error should display.
- [x] GENG5010 displays an error if it's not placed in the last enrolled period of the last year or in other words if another unit is enrolled in a later period.


# Clicking on unit
- [x] Clicking on Unit shows InfoBar
- [x] InfoBar displays unit information correctly.
- [x] Prerequisites are highlighted.
- [x] Or prerequisites are highlighted.
- [x] Corequisites are highlighted.
- [x] Selected unit highlighted.
- [x] The status bar shows the legend for highlights.
- [x] Units contingent on selected unit highlighted.
- [x] Contingent Or Units are highlighted.
- [x] Clicking on another unit updates the info bar.
- [x] Clicking on another unit removes previous highlighting.
- [x] Clicking on something that is not a unit clears the info bar and highlighting.
- [x] Status bar displays the correct status and the legend is removed.
- [x] If a unit is selected and if either it's corequistes, prerequisites, or contingent units has problems that need fixing, the highlighting should be a stripped pattern red and another colour depending on whether the unit is a corequisite, prerequisite or contingent unit.


# Highlight Buttons
- [x] Clicking on a highlight button highlights the relevant units.
- [x] Clicking on a highlight button shows the legend in the status bar.
- [x] Clicking on something that isn't a highlight button or unit clears highlighting and the legend.
- [x] Status bar displays the correct status and the legend is removed.
- [x] If units are highlighted and another highlight button is selected, the previous highlighting is cleared.
- [x] If units are highlighted and another highlight button is selected, the legend is updated.


# Option Bar
- [x] An illegal combination of option units doesn't occur.
- [x] When an option unit is added, the next legal units are displayed, and illegal ones are hidden.
- [x] If an option requirement isn't met it shouldn't be displayed until it is added to the planner.
- [x] Likewise, if an option requirement isn't met and it's placed back into the option bar the info bar should clear and so should the red highlighting for that unit.
- [x] Clicking on the collapse button should hide the option bar and the arrow should change.
- [x] Clicking on the collapse button when the bar is collapsed should reveal the option bar and not affect the option units it contains.
- [x] Units don't phase through the option bar if you scroll through it.
- [x] If a valid combination of option units is placed into the planner, the option bar should display no other units.
- [x] If a valid combination of option units is in the planner, the status bar should display done (provided there are no problems to fix) and the print to pdf button.
- [x] If a valid combination of option units is in the planner and the user drags one and drops it back into the planner, the status bar should display 'add option units' (provided there are no problems to fix).
- [x] If an option unit is added back to the option bar previously hidden option units should be shown provided they are a valid next option to choose with the combination currently in the planner.
- [x] If only one more option unit is required to create a valid combination, and the user drags the option unit over 'drag a unit here to add a row', a new row should be created, the option unit is placed in the correct semester,the status bar should change from 'add option units' to 'Done' (provided there are no problems to fix), AND the option bar should display no other units.


# Print to PDF
- [x] If the status bar displays 'Done', the print to pdf button should appear.
- [x] If the user clicks on the button a new tab is opened with a newly formated study planner.
- [x] The print page displays the planner preview in Landscape.
- [x] The duration of the study plan at the top of the planner should change depending on the duration of the user's study plan.
- [x] The commencement year should update depending on the commencement year chosen.
- [x] The period headings to the left should update the year depending on the commencement year chosen.
- [x] The period headings to the left should logically increase as the years and periods increase.
- [x] Units offered in both semester should have '**' next to their name.
- [x] The unit Codes should be bolded and broadening units should be normal.
- [x] Beneath the unit codes should be the name of the unit.
- [x] NS units should be in a yellow line, showing the Non-standard teaching period the user intends to complete the NS unit.
- [x] All units are displayed.
- [x] The heading at the top should update depending on the major selected.
- [x] There should be two superscripts at the bottom of the table. Providing a key and a disclaimer.
- [x] The pdf should be coloured correctly, matching the planner shown in the tab.
- [ ] The pdf when saved should be as shown in the print screen.