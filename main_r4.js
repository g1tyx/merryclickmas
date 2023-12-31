// Merry Clickmas
// code, content and graphics Copyright (C) 2013 Geoffrey White

// --- resources ---

var toys, toys_click, toys_mult, toys_clicked, toys_elves, toys_outsourced;
var presents, presents_click, presents_mult, presents_clicked, presents_elves, presents_machined, presents_mirrored;
var mirror_mult, win_stage;

var presents_goal = 7100000000;
var dbg_mult = 1;

function thousands(num)
{
	var left = String(num), right = "";

	// invariant: left + right = str(num), except for commas
	while (left.length >= 4)
	{
		// transfer the last thee digits
		right = "," + left.substr(left.length - 3, 3) + right;
		left = left.substr(0, left.length - 3);
	}

	return left + right;
}

function init_resources()
{
	toys = 0;
	toys_click = 1;
	toys_mult = 1;
	toys_clicked = 0;
	toys_elves = 0;
	toys_outsourced = 0;

	presents = 0;
	presents_click = 1;
	presents_mult = 1;
	presents_clicked = 0;
	presents_elves = 0;
	presents_machined = 0;
	presents_mirrored = 0;

	mirror_mult = 1;
	win_stage = 0;
}

function update_resources()
{
	var str, num;

	// victory
	if ((presents >= presents_goal) && (win_stage == 0))
	{
		win_stage = 1;
		save_flag = true;
	}
	if (win_stage == 1)
	{
		document.getElementById("div_win").style.visibility = "visible";
	} else {
		document.getElementById("div_win").style.visibility = "hidden";
	}
	if (win_stage > 0)
	{
		str = '<span style="color:#FFFF00">*** 恭喜，你拯救了圣诞节! ***</span>';
	} else if (upgrades.toys1.num >= 1) {
		str = "为世界上的每个人制作礼物并拯救圣诞节！";
	} else if (presents_clicked >= 10) {
		str = "购买升级，以便您可以更快地提升进度。";
	} else if ((toys_clicked >= 10) && (presents_clicked >= 1)) {
		str = "保持包装！";
	} else if (toys_clicked >= 10) {
		str = "现在点击“包装礼物”。";
	} else if (toys_clicked >= 1) {
		str = "这太好了 - 再制作一些玩具！";
	} else {
		str = "点击“制作玩具”制作玩具。";
	}
	document.getElementById("div_header").innerHTML = str;

	// toys
	if (toys > 1)
	{
		str = thousands(toys) + " 玩具";
	} else if (toys == 1) {
		str = "1 玩具";
	} else {
		str = "<br>";
	}
	document.getElementById("toy_count").innerHTML = str;

	// presents
	if (presents > 1)
	{
		str = thousands(presents) + " 礼物";
	} else if (presents == 1) {
		str = "1 礼物";
	} else {
		str = "<br>";
	}
	if (presents >= presents_goal)
	{
		if (tick_count % 2 == 0)
		{
			str = '<span style="color:#FF0000">' + str + '</span>';
		} else {
			str = '<span style="color:#00FF00">' + str + '</span>';
		}
	}
	document.getElementById("present_count").innerHTML = str;

	// achievements - statistics display
	num = toys_clicked + toys_elves + toys_outsourced;
	document.getElementById("toys_clicked_count").innerHTML =
		thousands(toys_clicked) + " (" + Math.round(toys_clicked * 100 / num) + "%)";
	if (toys_elves > 0)
	{
		document.getElementById("toys_elves_count").innerHTML =
			"精灵制造的玩具总数: " + thousands(toys_elves) + " (" +
			Math.round(toys_elves * 100 / num) + "%)<br>";
	} else {
		document.getElementById("toys_elves_count").innerHTML = "";
	}
	if (toys_outsourced > 0)
	{
		document.getElementById("toys_outsource_count").innerHTML =
			"总玩具交货抵达: " + thousands(toys_outsourced) + " (" +
			Math.round(toys_outsourced * 100 / num) + "%)<br>";
	} else {
		document.getElementById("toys_outsource_count").innerHTML = "";
	}

	num = presents_clicked + presents_elves + presents_machined + presents_mirrored;
	document.getElementById("presents_clicked_count").innerHTML =
		thousands(presents_clicked) + " (" + Math.round(presents_clicked * 100 / num) + "%)";
	if (presents_elves > 0)
	{
		document.getElementById("presents_elves_count").innerHTML =
			"由精灵包装的总礼物数量: " + thousands(presents_elves) + " (" +
			Math.round(presents_elves * 100 / num) + "%)<br>";
	} else {
		document.getElementById("presents_elves_count").innerHTML = "";
	}
	if (presents_machined > 0)
	{
		document.getElementById("presents_machined_count").innerHTML =
			"由机器包装的礼物总数: " + thousands(presents_machined) + " (" +
			Math.round(presents_machined * 100 / num) + "%)<br>";
	} else {
		document.getElementById("presents_machined_count").innerHTML = "";
	}
	if (presents_mirrored > 0)
	{
		document.getElementById("presents_mirrored_count").innerHTML =
			"通过镜子克隆的礼物总计: " + thousands(presents_mirrored) + " (" +
			Math.round(presents_mirrored * 100 / num) + "%)<br>";
	} else {
		document.getElementById("presents_mirrored_count").innerHTML = "";
	}
	if (upgrades.morale1.ever > 0)
	{
		document.getElementById("songs_count").innerHTML =
			"演唱的歌曲: " + thousands(upgrades.morale1.ever - upgrades.morale1.num) + "<br>";
	} else {
		document.getElementById("songs_count").innerHTML = "";
	}
}

function dismiss_win()
{
	win_stage = 2;
	update_resources();
}

function wrap_presents(n)
{
	var num = n;

	// cap at number of toys
	if (num > toys)
	{
		num = toys;
	}

	// wrap presents
	toys -= num;
	presents += num * mirror_mult;
	presents_mirrored += num * (mirror_mult - 1);

	return num;
}

// --- tick ---

var elf_makers, elf_wrappers, elf_morale_mult, elf_morale_time, machine_mult;
var ticker, next_tick, tick_count;

var play_mins, play_rem, play_unknown;

function init_tick()
{
	elf_makers = 0;
	elf_wrappers = 0;
	elf_morale_mult = 2;
	elf_morale_time = 0;
	machine_mult = 1000;
	tick_count = 0; // for animation only, not saved

	// play timer
	play_mins = 0; // full minutes
	play_rem = 0; // remainder ticks
	play_unknown = false;
}

function get_make_per_sec()
{
	var num;

	// elves
	num = elf_makers * toys_mult * dbg_mult;
	if (elf_morale_time > 0)
	{
		num *= elf_morale_mult;
	}

	return num;
}

function get_elf_wrap_per_sec()
{
	var num = elf_wrappers * presents_mult * dbg_mult;

	if (elf_morale_time > 0)
	{
		num *= elf_morale_mult;
	}

	return num;
}

function get_machine_wrap_per_sec()
{
	return upgrades.machine0.num * machine_mult * dbg_mult;
}

function get_tick_len()
{
	return 100000 / time_speed;
}

function update_play_timer()
{
	var mins = play_mins % 60;
	var hours = (play_mins - mins) / 60;
	var str = "";

	// hours
	if (hours > 1)
	{
		str += hours + " 小时 ";
	} else if (hours == 1) {
		str += "1 小时 ";
	}

	// minutes
	if (mins == 1)
	{
		str += "1 分钟";
	} else {
		str += mins + " 分钟";
	}
	if (play_unknown)
	{
		str += " +?";
	}
	document.getElementById("play_time").innerHTML = str;
}

function tick_resources()
{
	var cur_date = new Date();
	var cur_tick = cur_date.getTime();
	var done_ticks, save_seconds, num;

	// bound next_tick within 2 seconds of the current time in case of a discrepancy
	if (next_tick < cur_tick - 2000)
	{
		next_tick = cur_tick - 2000;
	}
	if (next_tick > cur_tick + 2000)
	{
		next_tick = cur_tick + 2000;
	}

	// run at least one tick
	done_ticks = 0;
	while ((done_ticks == 0) || (cur_tick >= next_tick))
	{
		done_ticks++;
		tick_count++;
		next_tick += get_tick_len();

		// update play timer
		play_rem += get_tick_len();
		if (play_rem > 60000)
		{
			play_mins++;
			play_rem -= 60000;

			update_play_timer();
		}

		// expire morale
		if (elf_morale_time > 0)
		{
			elf_morale_time -= dbg_mult;

			if (elf_morale_time <= 0)
			{
				// expire the upgrade
				upgrades.morale1.num--;

				// restart?
				if (upgrades.morale1.num >= 1)
				{
					elf_morale_time = 180;
				} else {
					update_buttons();
				}
			}
		}

		// produce toys
		num = get_make_per_sec();
		toys += num;
		toys_elves += num;

		// wrap presents
		num = wrap_presents(get_elf_wrap_per_sec());
		presents_elves += num;

		// auto-wrap presents
		num = wrap_presents(get_machine_wrap_per_sec());
		presents_machined += num;
		if (Math.random() * 60 * 60 * 5 < upgrades.machine0.num * dbg_mult)
		{
			// machine break down
			upgrades.machine0.num--;
			update_buttons();
		}

		// tick other components
		outsource_tick();
		wish_tick();

		// update stuff
		update_resources();
		update_upgrades();
	}

	// save
	save_seconds = Math.floor((cur_date.getTime() - save_last.getTime()) / 1000);
	if ((save_flag) || (save_seconds >= 60))
	{
		save_to_cookie();
		save_seconds = 0;
	}
	if (!saved_since_load)
	{
		document.getElementById("save_time").innerHTML = "无";
	} else if (save_seconds == 0) {
		document.getElementById("save_time").innerHTML = "刚刚";
	} else if (save_seconds == 1) {
		document.getElementById("save_time").innerHTML = "几秒前";
	} else {
		document.getElementById("save_time").innerHTML = save_seconds + " 秒前";
	}

	// wait
	ticker = setTimeout(function(){tick_resources()}, next_tick - cur_tick);
}

// --- buttons ---

function update_buttons()
{
	var str, num;

	// toy button
	num = toys_click * toys_mult;
	if (num == 1)
	{
		str = "+1 玩具";
	} else {
		str = "+" + thousands(num) +" 玩具";
	}
	document.getElementById("toy_button_text").innerHTML = str;

	// present button
	num = presents_click * presents_mult;
	if (num == 1)
	{
		str = "1 玩具 -> ";
	} else {
		str = thousands(num) + " 玩具 -> ";
	}
	num *= mirror_mult;
	if (num == 1)
	{
		str += "1 礼物";
	} else {
		str += thousands(num) + " 礼物";
	}
	document.getElementById("present_button_text").innerHTML = str;

	// elf panel
	if (elf_makers + elf_wrappers >= 1)
	{
		document.getElementById("div_elves").style.visibility = "visible";
	} else {
		document.getElementById("div_elves").style.visibility = "hidden";
	}

	// machines panel
	if (upgrades.machine1.num >= 1)
	{
		document.getElementById("div_machines").style.visibility = "visible";
	} else {
		document.getElementById("div_machines").style.visibility = "hidden";
	}

	// toy / sec
	num = get_make_per_sec();
	if (num > 0)
	{
		str = '(+' + thousands(num) + ' / 秒)';
	} else {
		str = '';
	}
	document.getElementById("toys_sec_count").innerHTML = str;

	// presents / sec
	num = (get_elf_wrap_per_sec() + get_machine_wrap_per_sec()) * mirror_mult;
	if (num > 0)
	{
		str = '(+' + thousands(num) + ' / 秒)';
	} else {
		str = '';
	}
	document.getElementById("presents_sec_count").innerHTML = str;

	// assign makers
	document.getElementById("makers_button_title").innerHTML = elf_makers;
	if (elf_makers == 1)
	{
		document.getElementById("makers_button_text").innerHTML = '小精灵';
	} else {
		document.getElementById("makers_button_text").innerHTML = '精灵';
	}

	// assign wrappers
	document.getElementById("wrappers_button_title").innerHTML = elf_wrappers;
	if (elf_wrappers == 1)
	{
		document.getElementById("wrappers_button_text").innerHTML = '小精灵';
	} else {
		document.getElementById("wrappers_button_text").innerHTML = '精灵';
	}

	// machines display
	document.getElementById("machines_button_title").innerHTML = upgrades.machine1.num;
	if (upgrades.machine1.num == 1)
	{
		document.getElementById("machines_button_text").innerHTML = '机器';
	} else {
		document.getElementById("machines_button_text").innerHTML = '机器';
	}

	// multipliers display
	document.getElementById("toys_mult").innerHTML = thousands(toys_mult);
	document.getElementById("wrap_mult").innerHTML = thousands(presents_mult);
}

function toy_click()
{
	var num = toys_click * toys_mult * dbg_mult;

	// make toys
	toys += num;
	toys_clicked += num;

	// update stuff
	update_resources();
	// (upgrades are never directly affected by toy count)
}

function present_click()
{
	var num;

	// wrap presents
	num = wrap_presents(presents_click * presents_mult * dbg_mult);
	presents_clicked += num;

	// update stuff
	update_resources();
	update_upgrades();
}

function maker_click()
{
	if (elf_wrappers > 0)
	{
		// transfer elf
		elf_makers++;
		elf_wrappers--;

		// update buttons
		update_buttons();
	}
}

function wrapper_click()
{
	if (elf_makers > 0)
	{
		// transfer elf
		elf_makers--;
		elf_wrappers++;

		// update buttons
		update_buttons();
	}
}

// --- upgrades ---

var upgrades =
{
	morale1:
	{
		title:"圣诞节歌咏",
		text:'你的精灵提高工作效率，制作 <span id="songs_mult_upg">两次</span> 在接下来的3分钟',
		icon:"note_r1.png",
		vis:function() {return (upgrades.elf.num >= 5)},
		cost:100,
		frequent:true,
		carry_out:function()
		{
			morale_refresh_count++;
			if (elf_morale_time <= 0) {elf_morale_time = 181};
			update_morale_upgrade()
		}
	},
	outsource1:
	{
		title:"外包交付",
		text:'你收到交付 <span id="outsource_in">1,000,000</span> 玩具在10分钟的时间。',
		icon:"present_r1.png",
		vis:function() {return (upgrades.elf.num >= 40)},
		cost:100000,
		frequent:true,
		carry_out:function() {outsource_time = 600; update_outsource_upgrade()}
	},
	machine0:
	{
		title:"机器保养",
		text:"修复一个卡纸包装的机器。",
		icon:"spanner_r1.png",
		vis:function() {return (upgrades.machine0.max >= 1)},
		cost:123456,
		init_max:0,
		frequent:true,
		carry_out:function() {}
	},

	toys1:
	{
		title:"重活",
		text:"增加你的玩具制造，2玩具/点击。",
		icon:"present_r1.png",
		vis:function() {return (presents_clicked >= 10)},
		cost:10,
		carry_out:function() {toys_click++;}
	},
	presents1:
	{
		title:"胶带座",
		text:"加速你的包装3礼物/点击。",
		icon:"present_r1.png",
		vis:function() {return (upgrades.toys1.num >= 1)},
		cost:10,
		carry_out:function() {presents_click += 2}
	},
	toys2:
	{
		title:"双手凿",
		text:"增加你的玩具制造，5玩具/点击。",
		icon:"present_r1.png",
		vis:function() {return (upgrades.presents1.num >= 1)},
		cost:50,
		carry_out:function() {toys_click += 3}
	},
	presents2:
	{
		title:"剪刀滑翔",
		text:"快速包装最多10个礼物/点击。",
		icon:"present_r1.png",
		vis:function() {return (upgrades.presents1.num >= 1)},
		cost:50,
		carry_out:function() {presents_click += 7}
	},
	elf:
	{
		title:"雇佣一个精灵",
		text:"雇佣一个精灵为你制造玩具和包装礼物",
		icon:"present_r1.png",
		vis:function() {return (upgrades.presents1.num >= 1)},
		cost:100,
		init_max:10,
		carry_out:function() {if (upgrades.elf.num % 2 == 1) {elf_makers++} else {elf_wrappers++}}
	},
	toys3:
	{
		title:"托尔的锤子",
		text:"将玩具制作增加到10个玩具/点击。",
		icon:"present_r1.png",
		vis:function() {return (upgrades.toys2.num >= 1)},
		cost:500,
		carry_out:function() {toys_click += 5}
	},
	presents3:
	{
		title:"喷雾包装",
		text:"快速包装最多20个礼物/点击。",
		icon:"present_r1.png",
		vis:function() {return (upgrades.presents2.num >= 1)},
		cost:500,
		carry_out:function() {presents_click += 10}
	},
	floor:
	{
		title:"2楼",
		text:"增加你的精灵上限 10.",
		icon:"present_r1.png",
		vis:function() {return (upgrades.elf.num >= 10)},
		cost:2000,
		init_max:-1,
		carry_out:function() {upgrades.elf.max += 10; update_floor_upgrade(upgrades.floor.num)}
	},
	reindeer1:
	{
		title:"驯鹿马厩",
		text:"建立一些马厩以保持驯鹿。",
		icon:"present_r1.png",
		vis:function() {return (upgrades.elf.num >= 10)},
		cost:2500,
		carry_out:function() {}
	},
	morale2:
	{
		title:"俗气的曲调",
		text:"唱歌的时候，你的精灵的生产力提高了三倍。",
		icon:"note_r1.png",
		vis:function() {return (morale_refresh_count >= 3)},
		cost:2500,
		carry_out:function() {elf_morale_mult++; update_morale_upgrade(); morale_refresh_count = 0}
	},
	toys4:
	{
		title:"缝纫机",
		text:"精灵和点击让玩具生产翻倍。",
		icon:"present_r1.png",
		vis:function() {return (upgrades.elf.num >= 10)},
		cost:5000,
		carry_out:function() {toys_mult++}
	},
	presents4:
	{
		title:"更严格的老板",
		text:"通过加倍精灵和点击本包装。",
		icon:"present_r1.png",
		vis:function() {return (upgrades.elf.num >= 10)},
		cost:5000,
		carry_out:function() {presents_mult++}
	},
	toys5:
	{
		title:"流水线",
		text:"增加你的玩具制作加成倍数X3。",
		icon:"present_r1.png",
		vis:function() {return (upgrades.toys4.num >= 1)},
		cost:10000,
		carry_out:function() {toys_mult++}
	},
	presents5:
	{
		title:"加班豁免",
		text:"将当前的包装倍数增加到 x3.",
		icon:"present_r1.png",
		vis:function() {return (upgrades.presents4.num >= 1)},
		cost:10000,
		carry_out:function() {presents_mult++}
	},
	toys6:
	{
		title:"注塑成型",
		text:"增加你的玩具制造倍数 x4.",
		icon:"present_r1.png",
		vis:function() {return (upgrades.toys5.num >= 1)},
		cost:20000,
		carry_out:function() {toys_mult++}
	},
	presents6:
	{
		title:"更短的休息时间",
		text:"将当前的包装倍数增加到 x4.",
		icon:"present_r1.png",
		vis:function() {return (upgrades.presents5.num >= 1)},
		cost:20000,
		carry_out:function() {presents_mult++}
	},
	reindeer2:
	{
		title:"比闪亮的光泽",
		text:"每个装饰的增加速度附加 2%.",
		icon:"present_r1.png",
		vis:function() {return ((upgrades.reindeer1.num >= 1) && (decoration_num >= 1))},
		cost:20000,
		carry_out:function() {decoration_mult += 2; update_reindeer()}
	},
	morale3:
	{
		title:"CD播放器",
		text:"您最多可以排队10首圣诞歌曲。",
		icon:"note_r1.png",
		vis:function() {return (upgrades.morale1.ever >= 6)},
		cost:25000,
		carry_out:function() {upgrades.morale1.max += 9;}
	},
	toys7:
	{
		title:"微芯片制造",
		text:"增加你的玩具制造倍数 x5.",
		icon:"present_r1.png",
		vis:function() {return (upgrades.toys6.num >= 1)},
		cost:50000,
		carry_out:function() {toys_mult++}
	},
	presents7:
	{
		title:"忍者训练",
		text:"将当前的包装倍数增加到 x5.",
		icon:"present_r1.png",
		vis:function() {return (upgrades.presents6.num >= 1)},
		cost:50000,
		carry_out:function() {presents_mult++}
	},
	morale4:
	{
		title:"MP3播放器",
		text:"您最多可以排队40首圣诞歌曲。",
		icon:"note_r1.png",
		vis:function() {return ((upgrades.morale1.ever >= 36) && (upgrades.morale3.num >= 1))},
		cost:50000,
		carry_out:function() {upgrades.morale1.max += 30;}
	},
	morale5:
	{
		title:"老歌",
		text:"唱歌的时候，你的精灵的生产力提高了4倍。",
		icon:"note_r1.png",
		vis:function() {return ((upgrades.morale2.num >= 1) && (morale_refresh_count >= 3))},
		cost:75000,
		carry_out:function() {elf_morale_mult++; morale_refresh_count = 0; update_morale_upgrade()}
	},
	toys8:
	{
		title:"虚拟商品",
		text:"使你的玩具进一步增加倍数 +1.",
		icon:"present_r1.png",
		vis:function() {return (upgrades.toys7.num >= 1)},
		cost:200000,
		init_max:5,
		carry_out:function() {toys_mult++}
	},
	presents8:
	{
		title:"额外的武器",
		text:"将当前的包装倍数再增加+1。",
		icon:"present_r1.png",
		vis:function() {return (upgrades.presents7.num >= 1)},
		cost:200000,
		init_max:5,
		carry_out:function() {presents_mult++}
	},
	outsource2:
	{
		title:"外包外包",
		text:"您可以排队多达5个外包交货。",
		icon:"present_r1.png",
		vis:function() {return (upgrades.outsource1.ever >= 3)},
		cost:500000,
		carry_out:function() {upgrades.outsource1.max += 4;}
	},
	machine1:
	{
		title:"自动包装机",
		text:'包装 <span id="machine_mult_upg">1,000</span> 礼物每秒',
		icon:"spanner_r1.png",
		vis:function() {return (upgrades.elf.num >= 100)},
		cost:1000000,
		init_max:10,
		carry_out:function() {upgrades.machine0.num++; upgrades.machine0.max++; update_machines_upgrade()}
	},
	outsource3:
	{
		title:"航空邮件",
		text:"增加您的交付收入 1,000,000.",
		icon:"present_r1.png",
		vis:function() {return (upgrades.outsource1.ever >= 3)},
		cost:2000000,
		carry_out:function() {outsource_mult++; update_outsource_upgrade()}
	},
	machine2:
	{
		title:"涡轮按钮",
		text:"增加机器包装 50%.",
		icon:"spanner_r1.png",
		vis:function() {return (upgrades.machine1.num >= 5)},
		cost:4000000,
		carry_out:function() {machine_mult += 500; update_machines_upgrade()}
	},
	outsource4:
	{
		title:"雪橇送货",
		text:"进一步提高您的交付收入 2,000,000.",
		icon:"present_r1.png",
		vis:function() {return (upgrades.outsource3.num >= 1)},
		cost:6000000,
		carry_out:function() {outsource_mult += 2; update_outsource_upgrade()}
	},
	machine3:
	{
		title:"水冷",
		text:"增加另一个机器包装 50%.",
		icon:"spanner_r1.png",
        
		vis:function() {return (upgrades.machine2.num >= 1)},
		cost:8000000,
		carry_out:function() {machine_mult += 500; update_machines_upgrade()}
	},
	machine4:
	{
		title:"地下一层",
		text:"增加你的机器上限 10.",
		icon:"spanner_r1.png",
		vis:function() {return (upgrades.machine1.num >= 10)},
		cost:10000000,
		carry_out:function() {upgrades.machine1.max += 10;}
	},
	machine5:
	{
		title:"人工智能",
		text:"增加另一个机器包装 50%.",
		icon:"spanner_r1.png",
		vis:function() {return (upgrades.machine3.num >= 1)},
		cost:12000000,
		carry_out:function() {machine_mult += 500; update_machines_upgrade()}
	},
	tree1:
	{
		title:"圣诞树",
		text:"在车间中间放一棵圣诞树。",
		icon:"tree_r1.png",
		vis:function() {return (upgrades.elf.num >= 120)},
		cost:20000000,
		carry_out:function() {}
	},
	tree2:
	{
		title:"更高的树",
		text:"圣诞祝福是两倍。",
		icon:"tree_r1.png",
		vis:function() {return (wish_count >= 1)},
		cost:50000000,
		carry_out:function() {wish_mult++; update_wish()}
	},
	machine6:
	{
		title:"异次元机房",
		text:"增加你的机器上限 20.",
		icon:"spanner_r1.png",
		vis:function() {return (upgrades.machine1.num >= 20)},
		cost:50000000,
		carry_out:function() {upgrades.machine1.max += 20;}
	},
	morale6:
	{
		title:"圣诞节第一",
		text:"唱歌的时候，你的精灵的生产力提高了8倍。",
		icon:"note_r1.png",
		vis:function() {return ((upgrades.elf.num >= 120) && (upgrades.morale5.num >= 1))},
		cost:100000000,
		carry_out:function() {elf_morale_mult += 4; update_morale_upgrade()}
	},
	tree3:
	{
		title:"最高的树",
		text:"圣诞祝福是五倍。",
		icon:"tree_r1.png",
		vis:function() {return (upgrades.tree2.num >= 1)},
		cost:250000000,
		carry_out:function() {wish_mult += 3; update_wish()}
	},
	mirrors1:
	{
		title:"魔镜",
		text:"每个玩具包装都会产生两个礼物而不是一个。",
		icon:"present_r1.png",
		vis:function() {return (upgrades.elf.num >= 140)},
		cost:500000000,
		carry_out:function() {mirror_mult++; update_mirrors_upgrade()}
	},
	mirrors2:
	{
		title:"镜子大厅",
		text:"将镜像倍增器增加到六倍。",
		icon:"present_r1.png",
		vis:function() {return (upgrades.mirrors1.num >= 1)},
		cost:1000000000,
		carry_out:function() {mirror_mult += 4; update_mirrors_upgrade()}
	},
}

var morale_refresh_count;

function init_upgrades()
{
	var str;
	var i = 0;

	// add upgrades to the html
	str = '<div class="box" id="upg_none">';
		str += '无可用升级。';
	str += '</div>';
	for (u in upgrades)
	{
		// number
		upgrades[u].num = 0;
		upgrades[u].ever = 0;
		if (upgrades[u].init_max === undefined)
		{
			upgrades[u].max = 1;
		} else {
			upgrades[u].max = upgrades[u].init_max;
		}
		upgrades[u].fixed_title = upgrades[u].title;

		// html
		upgrades[u].button_id = 'upg_' + u;
		upgrades[u].title_id = 'ttl_' + u;
		str += '<div id="' + upgrades[u].button_id + '">';
			str += '<div style="float:left;margin-top:8px;width:32px;height:32px">';
				str += '<img src="' + upgrades[u].icon + '" alt="" width=32 height=32>';
			str += '</div>';
			str += '<div style="position:relative;margin-left:46px">';
				str += '<div class="box_title" style="margin-bottom:4px" id="' + upgrades[u].title_id + '"></div>';
				str += upgrades[u].text;
			str += '</div>';
		str += '</div>';
	}
	document.getElementById("all_upgrades").innerHTML = str;

	// add onclicks
	for (u in upgrades)
	{
		document.getElementById(upgrades[u].button_id).onmouseup = make_buy_upgrade(u);
	}

	morale_refresh_count = 0;
}

function update_upgrades()
{
	var str, mod, str_list, vis_upgrades, ever_upgrades, total_upgrades;
	var box_type, vis, lessmax;

	// update upgrade state
	str_list = "";
	vis_upgrades = 0;
	ever_upgrades = 0;
	total_upgrades = 0;
	for (u in upgrades)
	{
		// update upgrade buttons
		vis = upgrades[u].vis();
		lessmax = (upgrades[u].num < upgrades[u].max) || (upgrades[u].max == -1);
		if (vis && lessmax)
		{
			// visible
			document.getElementById(upgrades[u].button_id).style.display = "block";
			vis_upgrades++;

			// box type
			if (upgrades[u].frequent)
			{
				box_type = "box box_frequent";
			} else {
				box_type = "box box_upgrade";
			}

			// greyed?
			if (presents >= upgrades[u].cost)
			{
				document.getElementById(upgrades[u].button_id).className = box_type;
				document.getElementById(upgrades[u].title_id).className = "box_title";
			} else {
				document.getElementById(upgrades[u].button_id).className = box_type + " greyed";
				document.getElementById(upgrades[u].title_id).className = "box_title_greyed";
			}

			// title string
			str = upgrades[u].title;
			if (upgrades[u].max > 1)
			{
				str += ' (' + upgrades[u].num + ' / ' + upgrades[u].max + ')';
			}
			str += ' [' + thousands(upgrades[u].cost) + ' 礼物]';
			document.getElementById(upgrades[u].title_id).innerHTML = str;
		} else if (vis && upgrades[u].frequent) {
			// visible
			document.getElementById(upgrades[u].button_id).style.display = "block";
			vis_upgrades++;

			// box type
			box_type = "box box_frequent";

			// greyed
			document.getElementById(upgrades[u].button_id).className = box_type + " greyed";
			document.getElementById(upgrades[u].title_id).className = "box_title_greyed";

			// title string
			str = upgrades[u].title;
			if (upgrades[u].max > 1)
			{
				str += ' (' + upgrades[u].num + ' / ' + upgrades[u].max + ')';
			}
			str += ' [等待]';
			document.getElementById(upgrades[u].title_id).innerHTML = str;
		} else {
			// hidden
			document.getElementById(upgrades[u].button_id).style.display = "none";
		}

		// update stats
		if (upgrades[u].ever > 0)
		{
			str_list += upgrades[u].fixed_title + '<br>';
			ever_upgrades++;
		}
		total_upgrades++;
	}

	// show no upgrades notice
	if (vis_upgrades == 0)
	{
		document.getElementById("upg_none").style.display = "block";
	} else {
		document.getElementById("upg_none").style.display = "none";
	}

	// update upgrade list / stat
	if (ever_upgrades == 0)
	{
		str += '无<br>';
	}
	document.getElementById("list_upgrades").innerHTML = str_list;
	document.getElementById("num_upgrades").innerHTML = ever_upgrades + ' of ' + total_upgrades;

	// show tabs
	if ((upgrades.toys1.num >= 1) && (document.getElementById("tab_achievements").style.visibility == "hidden"))
	{
		document.getElementById("tab_achievements").style.visibility = "visible";
	}
	if ((upgrades.reindeer1.num >= 1) && (document.getElementById("tab_reindeer").style.visibility == "hidden"))
	{
		document.getElementById("tab_reindeer").style.visibility = "visible";
	}
	if ((upgrades.tree1.num >= 1) && (document.getElementById("tab_tree").style.visibility == "hidden"))
	{
		document.getElementById("tab_tree").style.visibility = "visible";
	}
}

function update_morale_upgrade()
{
	// update morale multiplier string
	if (elf_morale_mult == 2)
	{
		str = "twice";
	} else if (elf_morale_mult == 3) {
		str = "three times";
	} else if (elf_morale_mult == 4) {
		str = "four times";
	} else if (elf_morale_mult == 8) {
		str = "eight times";
	} else {
		str = "???";
	}
	document.getElementById("songs_mult_upg").innerHTML = str;

	// update statistics
	if (upgrades.morale1.ever >= 1)
	{
		document.getElementById("songs_mult").innerHTML = "赞歌加成倍数: x" + thousands(elf_morale_mult) + "<br>";
	} else {
		document.getElementById("songs_mult").innerHTML = "";
	}
}

function update_machines_upgrade()
{
	document.getElementById("machine_mult_upg").innerHTML = thousands(machine_mult);
	if (upgrades.machine1.ever >= 1)
	{
		document.getElementById("machine_mult").innerHTML = "机器加成倍数: x" + (machine_mult / 1000) + "<br>";
	} else {
		document.getElementById("machine_mult").innerHTML = "";
	}
}

function update_mirrors_upgrade()
{
	if (mirror_mult >= 2)
	{
		document.getElementById("mirror_mult").innerHTML = "镜子加成倍数: x" + mirror_mult + "<br>";
	} else {
		document.getElementById("mirror_mult").innerHTML = "";
	}
}

function update_floor_upgrade(have_num)
{
	// update floor upgrade cost
	upgrades.floor.cost = 2000 * Math.pow(2, have_num);

	// update floor upgrade string
	str = have_num + 2;
	if ((str >= 10) && (str < 20))
	{
		str += "th"; // 10th .. 19th
	} else {
		var mod = str % 10;

		if (mod == 1)
		{
			str += "st"; // 1st, 21st...
		} else if (mod == 2) {
			str += "nd"; // 2nd, 22nd...
		} else if (mod == 3) {
			str += "rd"; // 3rd, 23rd...
		} else {
			str += "th"; // 0th, 4th...
		}
	}
	str += " 层";
	upgrades.floor.title = str;
}

function make_buy_upgrade(u)
{
	return function() {buy_upgrade(u);}
}

function buy_upgrade(u)
{
	if (upgrades[u].vis() && (presents >= upgrades[u].cost) &&
	   ((upgrades[u].num < upgrades[u].max) || (upgrades[u].max == -1)))
	{
		gain_upgrade(u);
	}
}

function gain_upgrade(u)
{
	// pay cost
	presents -= upgrades[u].cost;

	// gain upgrade
	upgrades[u].num++;
	upgrades[u].ever++;
	upgrades[u].carry_out();

	// update stuff
	update_resources();
	update_buttons();
	update_upgrades();

	save_flag = true;
}

// --- reindeer ---

var decorations =
[
	// 2013
	{	name:"a Christmas tree",
		fragments:[" tree"],
	},
	{	name:"a partridge in a pear tree",
		fragments:[" partridge", " pear tree"],
	},
	{	name:"tinsel",
		fragments:[" tinsel"],
	},
	{	name:"baubles",
		fragments:[" bauble", " ball"],
	},
	{	name:"glass ornaments",
		fragments:[" ornament", " glass decoration"],
	},
	{	name:"a star",
		fragments:[" star"],
	},
	{	name:"an angel",
		fragments:[" angel"],
	},
	{	name:"a fairy",
		fragments:[" fairy", " faerie", " faery"],
	},
	{	name:"a cherub",
		fragments:[" cherub"],
	},
	{	name:"pine cones",
		fragments:[" pine cone", " pinecone", "fir cone"],
	},
	{	name:"Christmas lights",
		fragments:[" light"],
	},
	{	name:"candles",
		fragments:[" candle", " tealight"],
	},
	{	name:"a lantern",
		fragments:[" lantern", "lamp ", "lamps "],
	},
	{	name:"bells",
		fragments:["bell ", "bells "],
	},
	{	name:"five gold rings",
		fragments:[" ring"],
	},
	{	name:"a trumpet",
		fragments:[" trumpet", " horn", " cornet"],
	},
	{	name:"a drum",
		fragments:[" drum"],
	},
	{	name:"ribbons",
		fragments:[" ribbon", " bow", " tape"],
	},
	{	name:"glitter",
		fragments:[" glitter"],
	},
	{	name:"a Merry Christmas banner",
		fragments:[" banner", " merry christmas", " happy christmas", " merry xmas", " happy xmas"],
	},
	{	name:"a Christmas wreath",
		fragments:[" wreath", " garland"],
	},
	{	name:"mistletoe",
		fragments:[" mistletoe"],
	},
	{	name:"holly",
		fragments:[" holly"],
	},
	{	name:"an advent calendar",
		fragments:[" advent", " calendar"],
	},
	{	name:"paper chains",
		fragments:[" chain", " streamer"],
	},
	{	name:"Christmas crackers",
		fragments:[" cracker"],
	},
	{	name:"Christmas cards",
		fragments:[" card"],
	},
	{	name:"Christmas presents",
		fragments:[" present", "parcel", " box", " gift", " prezzie", " prezzy"],
	},
	{	name:"toys",
		fragments:[" toy"],
	},
	{	name:"wrapping paper",
		fragments:[" wrap", " gift-wrap"],
	},
	{	name:"a Christmas stocking",
		fragments:[" stocking"],
	},
	{	name:"a Christmas sack",
		fragments:[" sack", " bag"],
	},
	{	name:"candy canes",
		fragments:[" candy", " candie", " sweets"],
	},
	{	name:"chocolate decorations",
		fragments:[" chocolate"],
	},
	{	name:"a Christingle",
		fragments:[" christingle", " orange"],
	},
	{	name:"a nativity scene",
		fragments:[" nativity", " bethlehem", " stable", " manger", " crib"],
	},
	{	name:"a figure of Mary",
		fragments:[" mary"],
	},
	{	name:"a figure of Joseph",
		fragments:[" joseph", " joeseph"],
	},
	{	name:"a figure of Jesus",
		fragments:[" jesus", " christ "],
	},
	{	name:"shepherd figures",
		fragments:[" shepherd"],
	},
	{	name:"wise men figures",
		fragments:[" wise men", " wise man", " king"],
	},
	{	name:"a toy soldier",
		fragments:[" soldier", " tin man", " tin men"],
	},
	{	name:"a donkey decoration",
		fragments:[" donkey", " ass ", " mule"],
	},
	{	name:"a robin decoration",
		fragments:[" robin"],
	},
	{	name:"a reindeer decoration",
		fragments:[" deer", "reindeer ", " rudolph"],
	},
	{	name:"a penguin decoration",
		fragments:[" penguin"],
	},
	{	name:"a polar bear decoration",
		fragments:[" polar bear"],
	},
	{	name:"a santa decoration",
		fragments:[" santa", " father christmas", " saint nic", " st nic"],
		not:[" hat"],
	},
	{	name:"an elf decoration",
		fragments:[" elf", " elves"],
	},
	{	name:"a sleigh decoration",
		fragments:[" sleigh", "sled ", "sleds "],
	},
	{	name:"a Christmas pudding decoration",
		fragments:[" pudding"],
	},
	{	name:"a turkey decoration",
		fragments:[" turkey"],
	},
	{	name:"a chimney decoration",
		fragments:[" chimney", " fireplace"],
	},
	{	name:"a snow globe",
		fragments:[" globe"],
	},
	{	name:"a snowman",
		fragments:[" snowman", " snow man", " snowmen", " snow men", " frosty"],
	},
	{	name:"snow decoration",
		fragments:[" snow", " flake", " flocking"],
	},
	{	name:"icicles",
		fragments:[" icicle", " ice"],
	},
	{	name:"santa hats",
		fragments:[" hat"],
	},
	{	name:"a lump of coal",
		fragments:[" coal"],
	},
	// 2014
	{	name:"ivy",
		fragments:[" ivy"],
	},
	{	name:"poinsettia",
		fragments:[" poinsettia", "poinsetta", "ponsettia"],
	},
	{	name:"a camel decoration",
		fragments:[" camel"],
	},
	{	name:"a nutcracker",
		fragments:[" nutcracker", " nut cracker"],
	},
	{	name:"a toy train",
		fragments:[" train", " locomotive"],
	},
	{	name:"a Christmas pickle",
		fragments:[" pickle"],
	},
	{	name:"chestnuts roasting on an open fire",
		fragments:[" chestnut"],
	},
	{	name:"a gingerbread house",
		fragments:[" gingerbread", "ginger bread"],
	},
]

var decoration_num, decoration_mult, time_speed;

function init_reindeer()
{
	decoration_num = 0;
	decoration_mult = 2;

	// init decorations
	for (d in decorations)
	{
		decorations[d].have = false;
	}

	document.getElementById("decoration_message").innerHTML = "";
}

function update_reindeer()
{
	var str;

	// update list of decorations and time_speed
	str = "";
	decoration_num = 0;
	for (d in decorations)
	{
		if (decorations[d].have)
		{
			str += decorations[d].name + '<br>';
			decoration_num++;
		}
	}
	time_speed = 100 + (decoration_num * decoration_mult);
	if (decoration_num == 0)
	{
		str = '无<br>';
	}
	document.getElementById("list_decorations").innerHTML = str;
	document.getElementById("time_speed_display").innerHTML = time_speed;
	document.getElementById("time_add_display").innerHTML = decoration_mult;

	// this can affect upgrades
	update_upgrades();
}

function input_reindeer()
{
	var input, i, match, match_length, skip;

	// read input
	input = ' ' + document.getElementById("input_decoration").value.toLowerCase() + ' ';

	// find a corresponding decoration
	match_length = 0;
	for (d in decorations)
	{
		skip = false;
		if (decorations[d].not)
		{
			for (i = 0; i < decorations[d].not.length; i++)
			{
				if (input.indexOf(decorations[d].not[i]) >= 0)
				{
					skip = true;
				}
			}
		}
		if (!skip)
		{
			for (i = 0; i < decorations[d].fragments.length; i++)
			{
				if ((input.indexOf(decorations[d].fragments[i]) >= 0) &&
				    (decorations[d].fragments[i].length >= match_length))
				{
					match = d;
					match_length = decorations[d].fragments[i].length;
				}
			}
		}
	}

	// add the decoration
	if (match)
	{
		if (!decorations[match].have)
		{
			decorations[match].have = true;
			document.getElementById("decoration_message").innerHTML = "好主意——添加 " + decorations[match].name + ".";

			update_reindeer();
			save_flag = true;
		} else {
			document.getElementById("decoration_message").innerHTML = "我们已经有了 " + decorations[match].name + ".";
		}
	} else if (input.length > 2) {
		document.getElementById("decoration_message").innerHTML = "我不明白你的意思。";
	} else {
		document.getElementById("decoration_message").innerHTML = "<br>";
	}

	// clear the form, do not submit it
	document.getElementById("input_decoration").value = "";
	return false;
}

// --- outsourcing ---

var outsource_time, outsource_mult;

function init_outsource()
{
	outsource_time = 0;
	outsource_mult = 1;
}

function outsource_tick()
{
	if (outsource_time > 0)
	{
		outsource_time -= 1 * dbg_mult;

		if (outsource_time <= 0)
		{
			// produce the toys
			toys += 1000000 * outsource_mult;
			toys_outsourced += 1000000 * outsource_mult;

			// remove the upgrade
			upgrades.outsource1.num--;

			// restart?
			if (upgrades.outsource1.num >= 1)
			{
				outsource_time = 600;
			} else {
				outsource_time = 0;
			}
		}
	}
}

function update_outsource_upgrade()
{
	document.getElementById("outsource_in").innerHTML = thousands(outsource_mult * 1000000);

	if (upgrades.outsource1.ever >= 1)
	{
		document.getElementById("outsource_mult").innerHTML = "交付加成倍数: x" + thousands(outsource_mult) + "<br>";
	} else {
		document.getElementById("outsource_mult").innerHTML = "";
	}
}

// --- wishes ---

var wishes =
[
	{
		name:"Faster toy making!",
		get_param:function() {return Math.floor(Math.random() * 10) + 1},
		get_text:function(param) {return "提高你的玩具制作加成倍数 +" + param + "."},
		carry_out:function(param) {toys_mult += param}
	},
	{
		name:"Faster wrapping!",
		get_param:function() {return Math.floor(Math.random() * 10) + 1},
		get_text:function(param) {return "提高你的礼物包装加成倍数 +" + param + "."},
		carry_out:function(param) {presents_mult += param}
	},
	{
		name:"Bigger deliveries!",
		get_param:function() {return Math.floor(Math.random() * 6) + 1},
		get_text:function(param) {return "你的交付产生了额外 " + thousands(param * 1000000) + " 玩具."},
		carry_out:function(param) {outsource_mult += param; update_outsource_upgrade()}
	},
	{
		name:"Another wish!",
		get_param:function() {return 0},
		get_text:function(param) {return "你立即得到另一个愿望。"},
		carry_out:function(param) {set_wish()}
	}
]

var wish1, wish1_param, wish2, wish2_param, wish_set;
var wish_time, wish_count, wish_mult;

function init_wish()
{
	wish_set = false;
	wish_time = 0;
	wish_count = 0;
	wish_mult = 1;
}

function wish_tick()
{
	if (wish_time > 0)
	{
		wish_time -= dbg_mult;
		update_wish();
	}

	if ((upgrades.tree1.num >= 1) && (wish_time <= 0) && (!wish_set))
	{
		wish_time = 0;
		set_wish();
	}
}

function set_wish()
{
	// choose wishes
	wish1 = Math.floor(Math.random() * wishes.length);
	wish2 = wish1;
	while (wish1 == wish2)
	{
		wish2 = Math.floor(Math.random() * wishes.length);
	}
	wish1_param = wishes[wish1].get_param();
	wish2_param = wishes[wish2].get_param();
	wish_set = true;

	// update display
	update_wish();
}

function update_wish()
{
	if (wish_set)
	{
		// show wishes
		document.getElementById("wishtext").innerHTML = "树上充满了圣诞魔法，准备给你一个愿望。 你选择什么？";
		document.getElementById("wish1").style.display = "block";
		document.getElementById("wish1_title").innerHTML = wishes[wish1].name;
		document.getElementById("wish1_text").innerHTML = wishes[wish1].get_text(wish1_param * wish_mult);
		document.getElementById("wish2").style.display = "block";
		document.getElementById("wish2_title").innerHTML = wishes[wish2].name;
		document.getElementById("wish2_text").innerHTML = wishes[wish2].get_text(wish2_param * wish_mult);
	} else if (wish_time >= 0) {
		// show countdown
		var mins = Math.floor((wish_time + 59) / 60);
		var ext = "s";

		if (mins == 1)
		{
			ext = "";
		}
		str = "你的下一个圣诞愿望将准备就绪在 <b>" + mins + "</b> 分钟" + ext + "...";
		document.getElementById("wishtext").innerHTML = str;
		document.getElementById("wish1").style.display = "none";
		document.getElementById("wish2").style.display = "none";
	} else {
		// hide wishes
		document.getElementById("wishtext").innerHTML = "";
		document.getElementById("wish1").style.display = "none";
		document.getElementById("wish2").style.display = "none";
	}

	// statistics
	if (wish_count > 0)
	{
		document.getElementById("wishes_count").innerHTML =
			"许愿: " + wish_count + "<br>";
	} else {
		document.getElementById("wishes_count").innerHTML = "";
	}
}

function gain_wish(index, param)
{
	if (wish_set)
	{
		// reset with wait
		wish_set = false;
		wish_time = 30 * 60;

		// gain wish
		wishes[index].carry_out(param * wish_mult);

		// update wish count
		wish_count++;

		// update stuff
		update_resources();
		update_buttons();
		update_upgrades();
		update_wish();
	
		save_flag = true;
	}
}

// --- tabs ---

var current_tab_id, current_content_id;

function show_tab(new_tab_id, new_content_id)
{
	if (current_tab_id)
	{
		document.getElementById(current_tab_id).className = "box box_upgrade";
		document.getElementById(current_content_id).style.display = "none";
	}

	// select new tab
	current_tab_id = new_tab_id;
	current_content_id = new_content_id;

	// highlight new tab, show contents
	if (current_tab_id)
	{
		document.getElementById(current_tab_id).className = "box box_upgrade selected";
		document.getElementById(current_content_id).style.display = "block";
	}
}

// --- save/load ---

var save_flag, save_last, saved_since_load;

function init_save()
{
	save_flag = false;
	save_last = new Date();
	saved_since_load = false;
}

function export_data()
{
	var data = [];

	// version
	data.push("cc2");

	// upgrades
	for (u in upgrades)
	{
		data.push(upgrades[u].num);
		data.push(upgrades[u].ever);
		data.push(upgrades[u].max);
	}
	data.push(morale_refresh_count);

	// resources
	data.push(toys.toString());
	data.push(toys_click.toString());
	data.push(toys_mult.toString());
	data.push(toys_clicked.toString());
	data.push(toys_elves.toString());
	data.push(toys_outsourced.toString());
	data.push(presents.toString());
	data.push(presents_click.toString());
	data.push(presents_mult.toString());
	data.push(presents_clicked.toString());
	data.push(presents_elves.toString());
	data.push(presents_machined.toString());
	data.push(presents_mirrored.toString());
	data.push(mirror_mult.toString());
	data.push(win_stage.toString());

	// elves
	data.push(elf_makers.toString());
	data.push(elf_wrappers.toString());
	data.push(elf_morale_mult.toString());
	data.push(elf_morale_time.toString());
	data.push(machine_mult.toString());

	// decorations
	for (d in decorations)
	{
		if (decorations[d].have)
		{
			data.push("y");
		} else {
			data.push("n");
		}
	}
	data.push(decoration_mult.toString());

	// outsourcing
	data.push(outsource_time.toString());
	data.push(outsource_mult.toString());

	// wishes
	if (wish_set)
	{
		data.push("y");
		data.push(wish1.toString());
		data.push(wish1_param.toString());
		data.push(wish2.toString());
		data.push(wish2_param.toString());
	} else {
		data.push("n");
	}
	data.push(wish_time.toString());
	data.push(wish_count.toString());
	data.push(wish_mult.toString());

	// play time
	data.push(play_mins.toString());
	data.push(play_rem.toString());
	if (play_unknown)
	{
		data.push("y");
	} else {
		data.push("n");
	}

	// end mark
	data.push("end");

	return data;
}

function import_data(data)
{
	var str;
	var verson = 0, format_decorations;

	data.reverse();

	// version
	str = data.pop();
	if (str == "cc1") {version = 1; format_decorations = 59;}
	if (str == "cc2") {version = 2; format_decorations = 67;}
	if (version == 0) {return false;}

	// upgrades
	for (u in upgrades)
	{
		upgrades[u].num = parseInt(data.pop());
		if (isNaN(upgrades[u].num)) {return false;}
		upgrades[u].ever = parseInt(data.pop());
		if (isNaN(upgrades[u].ever)) {return false;}
		upgrades[u].max = parseInt(data.pop());
		if (isNaN(upgrades[u].max)) {return false;}
	}
	morale_refresh_count = parseInt(data.pop());
	if (isNaN(morale_refresh_count)) {return false;}

	// resources
	toys = parseInt(data.pop());
	if (isNaN(toys)) {return false;}
	toys_click = parseInt(data.pop());
	if (isNaN(toys_click)) {return false;}
	toys_mult = parseInt(data.pop());
	if (isNaN(toys_mult)) {return false;}
	toys_clicked = parseInt(data.pop());
	if (isNaN(toys_clicked)) {return false;}
	toys_elves = parseInt(data.pop());
	if (isNaN(toys_elves)) {return false;}
	toys_outsourced = parseInt(data.pop());
	if (isNaN(toys_outsourced)) {return false;}
	presents = parseInt(data.pop());
	if (isNaN(presents)) {return false;}
	presents_click = parseInt(data.pop());
	if (isNaN(presents_click)) {return false;}
	presents_mult = parseInt(data.pop());
	if (isNaN(presents_mult)) {return false;}
	presents_clicked = parseInt(data.pop());
	if (isNaN(presents_clicked)) {return false;}
	presents_elves = parseInt(data.pop());
	if (isNaN(presents_elves)) {return false;}
	presents_machined = parseInt(data.pop());
	if (isNaN(presents_machined)) {return false;}
	presents_mirrored = parseInt(data.pop());
	if (isNaN(presents_mirrored)) {return false;}
	mirror_mult = parseInt(data.pop());
	if (isNaN(mirror_mult)) {return false;}
	win_stage = parseInt(data.pop());
	if (isNaN(win_stage)) {return false;}

	// elves
	elf_makers = parseInt(data.pop());
	if (isNaN(elf_makers)) {return false;}
	elf_wrappers = parseInt(data.pop());
	if (isNaN(elf_wrappers)) {return false;}
	elf_morale_mult = parseInt(data.pop());
	if (isNaN(elf_morale_mult)) {return false;}
	elf_morale_time = parseInt(data.pop());
	if (isNaN(elf_morale_time)) {return false;}
	machine_mult = parseInt(data.pop());
	if (isNaN(machine_mult)) {return false;}

	// decorations
	for (d in decorations)
	{
		if (d < format_decorations)
		{
			str = data.pop();
			if (str == "y")
			{
				decorations[d].have = true;
			} else if (str == "n") {
				decorations[d].have = false;
			} else {
				return false;
			}
		} else {
			// didn't exist in the save format
			decorations[d].have = false;
		}
	}
	decoration_mult = parseInt(data.pop());
	if (isNaN(decoration_mult)) {return false;}

	// outsourcing
	outsource_time = parseInt(data.pop());
	if (isNaN(outsource_time)) {return false;}
	outsource_mult = parseInt(data.pop());
	if (isNaN(outsource_mult)) {return false;}

	// wishes
	str = data.pop();
	if (str == "y")
	{
		wish_set = true;
		wish1 = parseInt(data.pop());
		if (isNaN(wish1)) {return false;}
		wish1_param = parseInt(data.pop());
		if (isNaN(wish1_param)) {return false;}
		wish2 = parseInt(data.pop());
		if (isNaN(wish2)) {return false;}
		wish2_param = parseInt(data.pop());
		if (isNaN(wish2_param)) {return false;}
	} else if (str == "n") {
		wish_set = false;
	} else {
		return false;
	}
	wish_time = parseInt(data.pop());
	if (isNaN(wish_time)) {return false;}
	wish_count = parseInt(data.pop());
	if (isNaN(wish_count)) {return false;}
	wish_mult = parseInt(data.pop());
	if (isNaN(wish_mult)) {return false;}

	// play time
	if (version >= 2)
	{
		play_mins = parseInt(data.pop());
		if (isNaN(play_mins)) {return false;}
		play_rem = parseInt(data.pop());
		if (isNaN(play_rem)) {return false;}

		str = data.pop();
		if (str == "y")
		{
			play_unknown = true;
		} else if (str == "n") {
			play_unknown = false;
		} else {
			return false;
		}
	} else {
		play_mins = 0;
		play_rem = 0;
		play_unknown = true;
	}

	// end mark
	str = data.pop();
	if (str != "end") {return false;}

	saved_since_load = false;
	return true;
}

function check_cookie()
{
	if (document.cookie.indexOf("savedata=") >= 0)
	{
		return true;
	} else {
		return false;
	}
}

function save_to_cookie()
{
	var days = 365 * 3; // ~3 years
	var cur_date = new Date();
	var expires = new Date(cur_date.getTime() + (days * 24 * 60 * 60 * 1000));
	var data = export_data();

	document.cookie = "savedata=" + data.join(",") + ";expires=" + expires.toGMTString() + ";";

	save_flag = false;
	save_last = cur_date;
	if (check_cookie())
	{
		saved_since_load = true;
	}
}

function save_to_cookie_manual()
{
	save_to_cookie();

	if (!check_cookie())
	{
		alert("保存失败。 请改用保存代码。");
	}
}

function load_from_cookie()
{
	var data = document.cookie.match("(^|;)[\s]*savedata=([^;]*)");
		// start of the string or a semi-colon; any amount of whitespace; savedata=;
		// string of non-semi-colon.

	if ((data) && (data[2]))
	{
		return import_data(data[2].split(","));
	} else {
		return false;
	}
}

function clear_save_cookie()
{
	document.cookie = "savedata=;expires=" + new Date(0).toGMTString() + ";";
}

function save_to_code()
{
	var data = export_data();

	prompt("Here is your save code.  Copy and paste it somewhere safe.", data.join(","));
}

function load_from_code()
{
	var data = prompt("Paste your save code here:", "");
	var valid = true;

	if (data != null)
	{
		var backup = export_data();

		// begin init
		init_start();

		// load game?
		if (!import_data(data.split(",")))
		{
			valid = false;

			// reset
			init_start();

			// restore backup
			import_data(backup);
		}

		// finish init
		init_finish();

		// reselect save tab
		show_tab('tab_save', 'cont_save');

		if (valid)
		{
			save_flag = true;
		} else {
			alert("该存档代码无效。");
		}
	}
}

// --- init ---

function init_start()
{
	// stop any existing tick
	if (ticker)
	{
		clearTimeout(ticker);
		ticker = undefined;
	}
	next_tick = undefined;

	// hide tabs
	document.getElementById("tab_reindeer").style.visibility = "hidden";
	document.getElementById("tab_tree").style.visibility = "hidden";
	document.getElementById("tab_achievements").style.visibility = "hidden";

	// init functions
	init_resources();
	init_tick();
	init_upgrades();
	init_reindeer();
	init_outsource();
	init_wish();
	init_save();
}

function init_finish()
{
	update_floor_upgrade(upgrades.floor.num);
	update_morale_upgrade();
	update_outsource_upgrade();
	update_machines_upgrade();
	update_mirrors_upgrade();
	update_wish();

	update_buttons();
	update_resources();
	update_upgrades();
	update_reindeer();
	update_play_timer();

	// show divs
	document.getElementById("div_resources").style.visibility = "visible";
	document.getElementById("div_tabs").style.visibility = "visible";

	// start tick
	{
		var cur_date = new Date();
		var cur_tick = cur_date.getTime();

		next_tick = cur_tick + get_tick_len();
		ticker = setTimeout(function(){tick_resources()}, next_tick - cur_tick);
	}
}

function init()
{
	// begin init
	init_start();

	// load game?
	if (!load_from_cookie())
	{
		// reset
		init_start();
	}

	// finish init
	init_finish();

	// select upgrades tab
	show_tab('tab_upgrades', 'cont_upgrades');
}

function reset_game()
{
	// reset cookie
	clear_save_cookie();

	// reset game
	init();

	// select upgrades tab
	show_tab('tab_upgrades', 'cont_upgrades');
}

function reset_game_confirm()
{
	var result = confirm("Are you sure you want to reset the game?  You will lose all progress.");

	if (result == true)
	{
		reset_game();
	}
}