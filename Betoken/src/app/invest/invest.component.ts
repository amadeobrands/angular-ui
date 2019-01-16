import { Component, OnInit, } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { AppComponent } from '../app.component';
import { Chart } from 'angular-highcharts';
import { NguCarousel, NguCarouselStore, NguCarouselService } from '@ngu/carousel';
import { Router } from '@angular/router';
import { BigNumber } from 'bignumber.js';

import { } from 'jquery';
declare var $: any;

import {
    user, timer, stats, investor_actions, tokens
} from '../../betokenjs/helpers';

@Component({
    selector: 'app-invest',
    templateUrl: './invest.component.html',
    animations: [
        trigger('toggleMenu', [
            state('open', style({
                'right': '0'
            })),
            state('close', style({
                'right': '-100%'
            })),
            transition('open <=> close', animate('300ms ease-in-out')),
        ]),

    ]
})

export class InvestComponent implements OnInit {
    walkthrough: boolean;
    step1: boolean;
    step2: boolean;
    step3: boolean;
    step4: boolean;
    investalert: boolean;
    footerbtn1: boolean;

    footerbtn2: boolean;
    changefundphase: boolean;
    changeStep1: boolean;
    changeStep2: boolean;
    changeStep3: boolean;
    changeStep4: boolean;
    changealert: boolean;

    footerbtn3: boolean;
    state: string;
    active: boolean;


    success: boolean;
    returnres: any;

    stock: Chart;
    bar: Chart;
    inputShare = 0.00;
    calculated_balance = 0.00;
    selectedTokenSymbol = 'DAI';

    sharePrice = 0;
    avgMonthReturn = 0;
    currMoROI = 0;
    totalUser = 0;
    AUM = 0;
    totalKairo = 0;
    totalBTFShares = 0;
    sharpeRatio = 0;
    standardDeviation = 0;

    days = 0;
    hours = 0;
    minutes = 0;
    seconds = 0;
    investflow = false;
    withdrawflow = false;

    private carouselToken: string;
    public carouselBanner: NguCarousel;
    tokenList: any;
    rankingArray = [];

    transactionId: '';

    openModalPopup() {
        this.ms.setPopUp();
    }
    openModalPopupW() {
        this.ms.setPopUpW();
    }

    constructor(private ms: AppComponent, private carousel: NguCarouselService, private route: Router) {

        if (localStorage.getItem('walkthrough') == null) {
            this.walkthrough = true;
        }
        this.state = 'close';
        this.active = false;


        this.step1 = true;
        this.step2 = false;
        this.step3 = false;
        this.step4 = false;
        this.investalert = false;

        this.changealert = false;
        this.changefundphase = false;
        this.changeStep1 = true;
        this.changeStep2 = false;
        this.changeStep3 = false;
        this.changeStep4 = false;

        this.footerbtn1 = true;
        this.footerbtn2 = false;
        this.footerbtn3 = false;
    }

    calculate_bal (event) {
        this.calculated_balance = event.target.value * 100.0000;
    }

    async updateDates() {
        this.days = timer.day;
        this.hours = timer.hour;
        this.minutes = timer.minute;
        this.seconds = timer.second;
    }

    ngOnInit() {
        let hasDrawnChart = false;
        setInterval(() => {
            this.avgMonthReturn = stats.avg_roi().toFormat(2);
            this.currMoROI = stats.cycle_roi().toFormat(4);
            this.AUM = stats.fund_value().toFormat(2);
            this.updateDates();
            this.rankingList();
            if (stats.raw_roi_data().length > 0) {
                if (!hasDrawnChart) {
                    hasDrawnChart = true;
                    this.drawChart();
                }
            }
        }, 100);

        this.carouselBanner = {
            grid: { xs: 1, sm: 1, md: 1, lg: 1, all: 0 },
            slide: 1,
            speed: 400,
            interval: 400000,
            point: {visible: true},
            load: 2,
            loop: true,
            touch: true
        };

        this.ms.getPopUp().subscribe((open: boolean) => {
            this.investflow = true;
            this.withdrawflow = false;
            if (open) {
                this.state = 'open';
                this.active = true;
            }

            if (!open) {
                this.state = 'close';
                this.active = false;
            }

        });

        this.ms.getPopUpW().subscribe((open: boolean) => {
            this.investflow = false;
            this.withdrawflow = true;
            if (open) {
                this.state = 'open';
                this.active = true;
            }

            if (!open) {
                this.state = 'close';
                this.active = false;
            }

        });

        this.ms.getchangefundPopUp().subscribe((open: boolean) => {
            if (open) {
                this.state = 'open';
                this.active = true;
                this.changefundphase = true;
                this.investalert = false;
                this.changeStep1 = true;
                this.changeStep2 = false;
                this.changeStep3 = false;
                this.changeStep4 = false;
            }

            if (!open) {
                this.state = 'close';
                this.active = false;
            }
        });
    }


    /* It will be triggered on every slide*/
    onmoveFn(data: NguCarouselStore) {
        console.log(data);
    }

    initDataFn(key: NguCarouselStore) {
        this.carouselToken = key.token;
    }

    resetFn() {
        this.carousel.reset(this.carouselToken);
    }

    shift() {
        for (let i = 0; i < 2 ; i++) {
            this.carousel.moveToSlide(this.carouselToken, i, false);
        }
    }

    closePopup() {
        this.state = 'close';
        this.active = false;
        this.step1 = true;
        this.step2 = false;
        this.step3 = false;
        this.step4 = false;
        this.footerbtn1 = false;
        this.footerbtn2 = true;

        if (this.changefundphase === true) {
            this.changeStep1 = true;
            this.changeStep2 = false;
            this.changeStep3 = false;
            this.changeStep4 = false;
            this.footerbtn2 = false;
            this.footerbtn3 = true;
        }
    }

    pending = (transactionHash) => {
        this.transactionId = transactionHash;
        this.step1 = false;
        this.step2 = false;
        this.step3 = true;
        this.step4 = false;
    }

    confirm = () => {
        this.step1 = false;
        this.step3 = false;
        this.step3 = false;
        this.step4 = true;
    }


    async withdraw() {
        investor_actions.withdraw_button(this.calculated_balance, this.selectedTokenSymbol, this.pending, this.confirm, (success) => {
            this.step2 = true;
            this.step1 = false;
            this.step3 = false;
            this.step4 = false;
        }, (error) => {
            alert(error);
        });
    }

    async invest() {
        investor_actions.deposit_button(this.calculated_balance, this.selectedTokenSymbol, this.pending, this.confirm, (success) => {
            this.step2 = true;
            this.step1 = false;
            this.step3 = false;
            this.step4 = false;
        }, (error) => {
            alert(error);
        });
    }

    updateTokenSymbol(value) {
        this.selectedTokenSymbol = value;
    }

    changefund() {
        this.changefundphase = true;
        this.investalert = false;
        this.openModalPopup();
        this.openModalPopupW();
    }

    changefundstep1() {
        this.changeStep2 = true;
        this.changeStep1 = false;
        this.changeStep3 = false;
        this.changeStep4 = false;
    }

    confirmcchangefund() {
        this.changeStep3 = true;
        this.changealert = true;
        this.changeStep1 = false;
        this.changeStep2 = false;
        this.changeStep4 = false;
        this.ms.setTradeBtn();
    }

    hideNextPhaseAlert() {
        this.changealert = false;
    }

    makeInvestment() {
        this.openModalPopup();
        this.openModalPopupW();
        this.route.navigate(['/proposal']);
    }

    async tokensList() {
        this.tokenList = tokens.token_list();
    }

    rankingList() {
        this.rankingArray =  stats.ranking();
        this.totalUser = this.rankingArray.length;
    }


    drawChart = () => {
        // Prepare data
        const cycles = [];
        const rois = [];
        for (const data of stats.raw_roi_data()) {
            cycles.push(data[0]);
            rois.push({
                y: data[1],
                color: data[1] > 0 ? '#18DAA3' : '#F4406B'
            });
        }
        if (timer.phase() === 1) {
            cycles.push(cycles.length + 1);
            rois.push({
                y: (new BigNumber(this.currMoROI)).toNumber(),
                color: (new BigNumber(this.currMoROI)).toNumber() > 0 ? '#18DAA3' : '#F4406B'
            });
        }


        this.stock = new Chart({
            title: {
                text: ''
            },
            xAxis: {
                categories: cycles,
                title: {
                    text: 'Months since fund\'s birth'
                }
            },
            yAxis: {
                title: {
                    text: 'ROI / %'
                }
            },
            credits: {
                enabled: false
            },
            legend: {
                enabled: false
            },
            series: [{
                type: 'column',
                name: 'ROI',
                data: rois
            }]
        });

        // calculate more stats for Betoken
        let BONDS_MONTHLY_INTEREST = 2.4662697e-3 // 3% annual interest rate
        let NUM_DECIMALS = 4;
        let calcMean = function(list) {
            return list.reduce(function(accumulator, curr) {
            return new BigNumber(accumulator).plus(curr);
            }).div(list.length);
        };
        let calcSampleStd = function(list) {
            var mean, sampleStd, sampleVar;
            mean = calcMean(list);
            sampleVar = list.reduce(function(accumulator, curr) {
            return new BigNumber(accumulator).plus(new BigNumber(curr - mean).pow(2));
            }, 0).div(list.length - 1);
            return sampleStd = sampleVar.sqrt();
        };
        // Sharpe Ratio (against BTC, since inception)
        let betokenROIList = rois.map((x) => new BigNumber(x.y));
        let meanExcessReturn = calcMean(betokenROIList).minus(BONDS_MONTHLY_INTEREST);
        let excessReturnList = [];
        for (let i = 0; i < betokenROIList.length; i++) {
            excessReturnList[i] = betokenROIList[i].minus(BONDS_MONTHLY_INTEREST);
        }
        let excessReturnStd = calcSampleStd(excessReturnList);

        this.sharpeRatio = meanExcessReturn.div(excessReturnStd).dp(NUM_DECIMALS);
        this.standardDeviation = calcSampleStd(betokenROIList).dp(NUM_DECIMALS);
    }

}
