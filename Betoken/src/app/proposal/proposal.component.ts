import { Component, OnInit } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { AppComponent } from '../app.component';
import { user, timer, manager_actions, loading, tokens, refresh_actions } from '../../betokenjs/helpers';

@Component({
    selector: 'app-proposal',
    templateUrl: './proposal.component.html',
    styleUrls: ['./proposal.component.scss'],
    animations: [
        trigger('toggleProposal', [
            state('open', style({
                'right': '0'
            })),
            state('close', style({
                'right': '-100%'
            })),
            transition('open <=> close', animate('300ms ease-in-out')),
        ])

    ]
})

export class ProposalComponent implements OnInit {
    state: string;
    active: boolean;

    proposalfund: boolean;
    changeproposalfund: boolean;
    tradeproposalfund: boolean;

    step1: boolean;
    step2: boolean;
    step3: boolean;
    step4: boolean;

    sellStep1: boolean;
    sellStep2: boolean;
    sellStep3: boolean;
    sellStep4: boolean;

    changeStep1: boolean;
    changeStep2: boolean;
    changeStep3: boolean;
    changeStep4: boolean;

    sellalert: boolean;
    nextphasealert: boolean;
    redeemalert: boolean;

    footerbtn1: boolean;
    footerbtn2: boolean;
    footerbtn3: boolean;

    success: boolean;
    tradeAssetval: any;

    days = 0;
    hours = 0;
    minutes = 0;
    seconds = 0;
    phase = -1;
    kairo_balance = 0.0000;
    selectedTokenSymbol = 'ETH';
    kairoinput = '';
    symbolToPrice = '';
    activeInvestmentList: any;
    inactiveInvestmentList: any;
    sellId: any;
    tokenList: any;
    transactionId: '';
    kroRedeemed: '';
    openchangefundModal() {
        this.updateTokenSymbol('ETH');
        this.ms.setproposalPopUp();
    }



    constructor(private ms: AppComponent) {

        this.updateTokenSymbol(this.selectedTokenSymbol);

        setInterval(() => {
            if (user.address() !== '0x0') {
                this.updateDates();
                this.refreshDisplay();
                this.tokenList = tokens.token_list();
            }
        }, 100);

        this.state = 'close';
        this.active = false;

        this.step1 = true;
        this.step2 = false;
        this.step3 = false;

        this.sellalert = false;
        this.nextphasealert = false;
        this.redeemalert = false;

        this.proposalfund = true;
        this.changeproposalfund = false;
        this.tradeproposalfund = false;

        this.sellStep1 = true;
        this.sellStep2 = false;
        this.sellStep3 = false;
        this.sellStep4 = false;

        this.changeStep1 = true;
        this.changeStep2 = false;
        this.changeStep3 = false;
        this.changeStep4 = false;

        this.footerbtn1 = true;
        this.footerbtn2 = false;
        this.footerbtn3 = false;
    }

    async updateDates() {
        this.days = timer.day();
        this.hours = timer.hour();
        this.minutes = timer.minute();
        this.seconds = timer.second();
        this.phase = timer.phase();
    }

    ngOnInit() {
        this.ms.getproposalPopUp().subscribe((open: boolean) => {

            if (open) {
                this.state = 'open';
                this.active = true;
            }

            if (!open) {
                this.state = 'close';
                this.active = false;
            }
        });

        this.ms.getproposalchange().subscribe((open: boolean) => {

            if (open) {
                this.changeproposal();
            }

            if (!open) {
                this.state = 'close';
                this.active = false;
            }
        });

    }

    proposalPopup() {
        this.ms.setproposalPopUp();
    }

    changeproposalPopup() {
        this.sellalert = false;
        this.changeproposal();
    }

    closePopup() {
        this.state = 'close';
        this.active = false;
        this.kairoinput = '';
        this.selectedTokenSymbol = 'ETH';
        if (this.proposalfund = true) {
            this.proposalfund = true;
            this.tradeproposalfund = false;
            this.changeproposalfund = false;
            this.step1 = true;
            this.step2 = false;
            this.step3 = false;
            this.step4 = false;
        } else if (this.tradeproposalfund = true) {
            this.tradeproposalfund = true;
            this.proposalfund = false;
            this.changeproposalfund = false;
            this.sellStep1 = true;
            this.sellStep2 = false;
            this.sellStep3 = false;
            this.sellStep4 = false;
        } else if (this.changeproposalfund = true) {
            this.changeproposalfund = true;
            this.proposalfund = false;
            this.tradeproposalfund = false;
            this.changeStep1 = true;
            this.changeStep2 = false;
            this.changeStep3 = false;
            this.changeStep4 = false;
        }

    }

    support() {
        this.step2 = true;
        this.step3 = false;
        this.step4 = false;
        this.step1 = false;
        this.invest();
    }

    pending = (transactionHash) => {

        this.transactionId = transactionHash;
        this.step3 = true;
        this.step4 = false;
        this.step1 = false;
        this.step2 = false;
    }

    confirm = () => {
        this.step1 = false;
        this.step2 = false;
        this.step3 = false;
        this.step4 = true;
    }

    newsupport() {
        this.closePopup();
    }

    hidealert() {
        this.sellalert = false;
        this.nextphasealert = true;
        this.ms.setNextButton();
    }

    sell(data) {
        this.openchangefundModal();
        this.sellId = data.id;
        this.kroRedeemed = data.currValue;
        this.sellInvestment();

        this.tradeproposalfund = true;
        this.changeproposalfund = false;
        this.proposalfund = false;
        this.redeemalert = false;
        this.nextphasealert = false;
        this.sellStep1 = true;
        this.sellStep2 = false;
        this.sellStep3 = false;

    }

    pendingSell = (transactionHash) => {
        this.sellStep2 = true;
        this.sellStep3 = false;
        this.sellStep1 = false;
        this.transactionId = transactionHash;
    }

    confirmSell = () => {
        this.sellStep1 = false;
        this.sellStep2 = false;
        this.sellStep3 = true;
    }

    changeproposal() {
        this.openchangefundModal();
        this.changeproposalfund = true;
        this.tradeproposalfund = false;
        this.proposalfund = false;
        this.changeStep1 = true;
        this.changeStep2 = false;
        this.changeStep3 = false;
        this.nextphasealert = false;
    }

    changefundstep1() {
        this.changeStep2 = true;
        this.changeStep3 = false;
        this.changeStep1 = false;
    }

    confirmcchangefund() {
        this.changeStep3 = true;
        this.changeStep1 = false;
        this.changeStep2 = false;
        this.footerbtn3 = true;
        this.footerbtn1 = false;
        this.footerbtn2 = false;
    }

    finalchangefund() {
        this.closePopup();
        this.redeemalert = true;
        this.ms.setRedeemButton();
    }

    updateTokenSymbol(event) {
        const value = event;
        this.selectedTokenSymbol = value;
        const price = tokens.asset_symbol_to_price(this.selectedTokenSymbol);
        this.tradeAssetval = price;
        return event;
    }

    refreshDisplay() {
        this.activeInvestmentList = user.investment_list().filter((data) => data.isSold === false);
        this.inactiveInvestmentList = user.investment_list().filter((data) => data.isSold === true);
    }

    refresh() {
        refresh_actions.investments();
    }

    invest() {
        manager_actions.new_investment(this.selectedTokenSymbol, this.kairoinput, this.pending, this.confirm);
    }

    sellInvestment() {
        manager_actions.sell_investment(this.sellId, this.pendingSell, this.confirmSell, (success) => {
            console.log(JSON.stringify(success));
        }, (error) => {
            alert(error);
        });
    }

    kairoInput (event) {
        this.kairoinput = event.target.value ;
    }

    isLoading() {
        return loading.investments();
    }
}
